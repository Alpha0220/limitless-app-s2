import Airtable from 'airtable';

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  throw new Error('Missing Airtable credentials');
}

export const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY,
  requestTimeout: 60000, // 60 seconds timeout (increased for better reliability)
}).base(process.env.AIRTABLE_BASE_ID);
export const TABLE_NAME = 'BillingInformation';
export const REGISTRATION_TABLE_NAME = 'Registration';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds (increased initial delay)
const MAX_RETRY_DELAY = 15000; // 15 seconds (increased max delay)

/**
 * Utility function to retry operations with exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if error is retryable (timeout or network errors)
      const isRetryable = 
        error?.code === 'ETIMEDOUT' ||
        error?.errno === 'ETIMEDOUT' ||
        error?.type === 'system' ||
        error?.status === 429 || // Rate limit
        error?.status >= 500; // Server errors
      
      if (!isRetryable || attempt === maxRetries) {
        // Don't retry if error is not retryable or we've exhausted retries
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        INITIAL_RETRY_DELAY * Math.pow(2, attempt),
        MAX_RETRY_DELAY
      );
      
      console.warn(
        `[Airtable Retry] ${operationName} failed (attempt ${attempt + 1}/${maxRetries + 1}). ` +
        `Retrying in ${delay}ms... Error: ${error?.message || error}`
      );
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

export interface StudentRecord {
  id: string; // Airtable Record ID
  fields: {
    id?: number;
    uuid?: string;
    full_name?: string;
    nickname?: string;
    name_class?: string;
    date?: string;
    company_name?: string;
    taxpayer_name?: string;
    tax_id?: string;
    tax_addres?: string;
    bill_email?: string;
    user_email?: string;
    remark?: string;
    full_name_certificate?: string;
    phone_num?: string;
    name_sale?: string;
    is_update?: boolean;
    is_email_sent?: 'success' | 'fail' | 'pending';
    Document?: { url: string; filename: string }[]; // Changed to Capitalized 'Document'
  };
}

export async function getStudentsByReferenceId(refid: string): Promise<StudentRecord[]> {
  return retryWithBackoff(async () => {
    try {
      // Note: User prompt mentioned filter criteria explicitly.
      // Assuming 'uuid' column matches the 'refid' passed in URL.
      const records = await base(TABLE_NAME).select({
        filterByFormula: `{uuid} = '${refid}'`,
        // limit removed to support multiple students
      }).firstPage();

      return records.map(record => ({
        id: record.id,
        fields: record.fields as StudentRecord['fields'],
      }));
    } catch (error) {
      console.error(`Error fetching students from Airtable (refid: ${refid}):`, error);
      throw error;
    }
  }, `getStudentsByReferenceId(${refid})`).catch(() => {
    // Return empty array on final failure
    return [];
  });
}

export async function getSales(): Promise<string[]> {
  return retryWithBackoff(async () => {
    try {
      const records = await base('Sale').select({
        fields: ['nickname'],
      }).all();

      return records
        .map(record => record.fields.nickname as string)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'th'));
    } catch (error) {
      console.error('Error fetching sales from Airtable:', error);
      throw error;
    }
  }, 'getSales').catch(() => []);
}

export async function getAllStudents(): Promise<StudentRecord[]> {
  return retryWithBackoff(async () => {
    try {
      const records = await base(TABLE_NAME).select({
        view: 'Grid view',
        fields: ['id', 'full_name', 'full_name_certificate', 'name_class', 'uuid', 'is_update', 'nickname', 'is_email_sent', 'date'],
        sort: [{ field: 'uuid', direction: 'asc' }]
      }).all();

      return records.map(record => ({
        id: record.id,
        fields: record.fields as StudentRecord['fields'],
      }));
    } catch (error) {
      console.error('Error fetching all students:', error);
      throw error;
    }
  }, 'getAllStudents').catch(() => {
    // Return empty array on final failure
    return [];
  });
}

export async function getStudentById(recordId: string): Promise<StudentRecord | null> {
  return retryWithBackoff(async () => {
    try {
      const record = await base(TABLE_NAME).find(recordId);
      return {
        id: record.id,
        fields: record.fields as StudentRecord['fields'],
      };
    } catch (error) {
      console.error(`Error fetching student by ID (recordId: ${recordId}):`, error);
      throw error;
    }
  }, `getStudentById(${recordId})`).catch(() => {
    // Return null on final failure
    return null;
  });
}

export async function updateStudentInAirtable(recordId: string, data: Partial<StudentRecord['fields']>) {
  return retryWithBackoff(async () => {
    try {
      // Force is_update to true as per workflow requirements
      const updateData = {
        ...data,
        is_update: true
      };

      const record = await base(TABLE_NAME).update(recordId, updateData as any);
      return { success: true, record };
    } catch (error) {
      console.error(`Error updating student in Airtable (recordId: ${recordId}):`, error);
      throw error;
    }
  }, `updateStudentInAirtable(${recordId})`);
}

export async function updateEmailStatus(recordId: string, status: 'success' | 'fail') {
  return retryWithBackoff(async () => {
    try {
      const record = await base(TABLE_NAME).update(recordId, {
        is_email_sent: status
      });
      return { success: true, record };
    } catch (error) {
      console.error(`Error updating email status in Airtable (recordId: ${recordId}, status: ${status}):`, error);
      throw error;
    }
  }, `updateEmailStatus(${recordId}, ${status})`);
}

/**
 * Update email status without blocking - runs in background
 * This is useful when email has already been sent and we don't want to block the response
 */
export async function updateEmailStatusNonBlocking(recordId: string, status: 'success' | 'fail') {
  // Run in background without awaiting
  updateEmailStatus(recordId, status).catch((error) => {
    console.error(`[Background] Failed to update email status (recordId: ${recordId}, status: ${status}):`, error);
    // Could implement retry queue or notification here if needed
  });
  
  return { success: true, message: 'Email status update queued' };
}

/**
 * Update Document field specifically for attachment files
 * This function handles the attachment field format correctly
 */
export async function updateDocumentField(recordId: string, fileUrl: string, filename: string) {
  return retryWithBackoff(async () => {
    try {
      // Airtable attachment field format: array of attachment objects
      // Each attachment object should have: { url: string, filename?: string }
      // For PDFs and other documents, ensure URL is properly formatted
      
      // Ensure URL is absolute and properly formatted
      const formattedUrl = fileUrl.startsWith('http') ? fileUrl : `https://${fileUrl}`;
      
      // Determine file type from extension
      const fileExtension = filename.split('.').pop()?.toLowerCase();
      const isPDF = fileExtension === 'pdf';
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension || '');
      
      // Airtable attachment format: array of objects with url and optional filename
      // Try different formats for PDFs vs images
      // Airtable may require different formats for different file types
      let attachmentData: any[];
      
      if (isPDF) {
        // For PDFs, use standard format with url and filename
        attachmentData = [{
          url: formattedUrl,
          filename: filename
        }];
      } else {
        // For images and other files
        attachmentData = [{
          url: formattedUrl,
          filename: filename
        }];
      }

      console.log(`[Airtable] Updating Document field with attachment:`, {
        recordId,
        url: formattedUrl,
        filename,
        fileType: fileExtension,
        isPDF,
        attachmentFormat: JSON.stringify(attachmentData, null, 2)
      });

      // Try updating with the attachment data
      let record: any;
      try {
        record = await base(TABLE_NAME).update(recordId, {
          Document: attachmentData
        } as any);
      } catch (firstError: any) {
        // If first attempt fails for PDF, try alternative format
        if (isPDF && firstError?.error) {
          console.warn(`[Airtable] First attempt failed for PDF, trying alternative format...`);
          
          // Try without filename
          const altAttachmentData = [{
            url: formattedUrl
          }];
          
          try {
            record = await base(TABLE_NAME).update(recordId, {
              Document: altAttachmentData
            } as any);
            console.log(`[Airtable] Alternative format (without filename) succeeded`);
          } catch (secondError: any) {
            // If still fails, throw the original error
            throw firstError;
          }
        } else {
          throw firstError;
        }
      }

      // Verify the update was successful by checking the response
      console.log(`[Airtable] Update response:`, {
        recordId: record.id,
        documentField: record.fields.Document,
        documentFieldType: typeof record.fields.Document,
        documentFieldLength: Array.isArray(record.fields.Document) ? record.fields.Document.length : 'not array'
      });

      // Check if Document field was actually updated
      if (record.fields.Document && Array.isArray(record.fields.Document)) {
        const docUrls = record.fields.Document.map((doc: any) => doc?.url || doc);
        const docIds = record.fields.Document.map((doc: any) => doc?.id || 'no-id');
        console.log(`[Airtable] Document URLs in response:`, docUrls);
        console.log(`[Airtable] Document IDs in response:`, docIds);
        
        // Verify the URL matches
        const urlMatches = docUrls.some((url: string) => url === formattedUrl || url.includes(formattedUrl.split('/').pop() || ''));
        if (!urlMatches) {
          console.warn(`[Airtable] WARNING: Document URL not found in response! Expected: ${formattedUrl}, Got: ${docUrls.join(', ')}`);
        } else {
          console.log(`[Airtable] ✓ Document URL verified in response`);
        }
        
        // Log full attachment object for debugging
        if (record.fields.Document[0]) {
          console.log(`[Airtable] Full attachment object:`, JSON.stringify(record.fields.Document[0], null, 2));
        }
      } else {
        console.warn(`[Airtable] WARNING: Document field is not an array or is missing! Got:`, record.fields.Document);
      }

      console.log(`[Airtable] ✓ Document field updated successfully for ${filename}`);
      return { success: true, record };
    } catch (error: any) {
      console.error(`Error updating Document field in Airtable (recordId: ${recordId}, filename: ${filename}):`, error);
      
      // Log detailed error for debugging
      if (error?.error) {
        console.error('[Airtable] Error details:', JSON.stringify(error.error, null, 2));
        
        // Check for specific error types
        if (error.error === 'INVALID_VALUE_FOR_COLUMN') {
          console.error('[Airtable] Invalid value for column - check Document field type and format');
        }
        if (error.error === 'UNKNOWN_FIELD_NAME') {
          console.error('[Airtable] Unknown field name - check if Document field exists in Airtable');
        }
      }
      if (error?.message) {
        console.error('[Airtable] Error message:', error.message);
      }
      
      // Log the full error for debugging
      console.error('[Airtable] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      throw error;
    }
  }, `updateDocumentField(${recordId})`);
}

export async function updateRegistrationReceiptByUuid(uuid: string, attachmentData: any[]) {
  return retryWithBackoff(async () => {
    try {
      // 1. Find the registration record by uuid
      const records = await base(REGISTRATION_TABLE_NAME).select({
        filterByFormula: `{uuid} = '${uuid}'`,
        maxRecords: 1
      }).firstPage();

      if (records.length === 0) {
        throw new Error(`Registration record not found for uuid: ${uuid}`);
      }

      const recordId = records[0].id;

      // 2. Get existing receipts and merge with new ones
      const existingReceipts = records[0].fields.Receipt as any[] || [];
      const updatedReceipts = [...existingReceipts, ...attachmentData];

      // 3. Update the Receipt field
      const record = await base(REGISTRATION_TABLE_NAME).update(recordId, {
        Receipt: updatedReceipts
      } as any);

      return { success: true, record };
    } catch (error) {
      console.error(`Error updating registration receipt (uuid: ${uuid}):`, error);
      throw error;
    }
  }, `updateRegistrationReceiptByUuid(${uuid})`);
}

export async function getRegistrationByUuid(uuid: string) {
  return retryWithBackoff(async () => {
    try {
      const records = await base(REGISTRATION_TABLE_NAME).select({
        filterByFormula: `{uuid} = '${uuid}'`,
        maxRecords: 1
      }).firstPage();

      if (records.length === 0) return null;

      return {
        id: records[0].id,
        fields: records[0].fields
      };
    } catch (error) {
      console.error(`Error fetching registration by uuid (${uuid}):`, error);
      throw error;
    }
  }, `getRegistrationByUuid(${uuid})`);
}

export async function updateRegistrationPayerByUuid(uuid: string, payerName: string) {
  return retryWithBackoff(async () => {
    try {
      const records = await base(REGISTRATION_TABLE_NAME).select({
        filterByFormula: `{uuid} = '${uuid}'`,
        maxRecords: 1
      }).firstPage();

      if (records.length === 0) {
        throw new Error(`Registration record not found for uuid: ${uuid}`);
      }

      const recordId = records[0].id;

      const record = await base(REGISTRATION_TABLE_NAME).update(recordId, {
        name_regis: payerName
      } as any);

      return { success: true, record };
    } catch (error) {
      console.error(`Error updating registration payer (uuid: ${uuid}):`, error);
      throw error;
    }
  }, `updateRegistrationPayerByUuid(${uuid})`);
}
