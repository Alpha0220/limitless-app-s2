import Airtable from 'airtable';

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  throw new Error('Missing Airtable credentials');
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const TABLE_NAME = 'BillingInformation';

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
    is_update?: boolean;
    is_email_sent?: 'success' | 'fail' | 'pending';
    // Document field omitted for initial implementation as it requires file hosting
  };
}

export async function getStudentsByReferenceId(refid: string): Promise<StudentRecord[]> {
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
    console.error('Error fetching students from Airtable:', error);
    return [];
  }
}

export async function getAllStudents(): Promise<StudentRecord[]> {
  try {
    const records = await base(TABLE_NAME).select({
      view: 'Grid view', // Verify view name or remove if strict filtering not needed
      fields: ['id', 'full_name', 'name_class', 'uuid', 'is_update', 'nickname', 'is_email_sent'], // Fetch only necessary fields
      sort: [{ field: 'uuid', direction: 'asc' }]
    }).all();

    return records.map(record => ({
      id: record.id,
      fields: record.fields as StudentRecord['fields'],
    }));
  } catch (error) {
    console.error('Error fetching all students:', error);
    return [];
  }
}

export async function getStudentById(recordId: string): Promise<StudentRecord | null> {
  try {
    const record = await base(TABLE_NAME).find(recordId);
    return {
      id: record.id,
      fields: record.fields as StudentRecord['fields'],
    };
  } catch (error) {
    console.error('Error fetching student by ID:', error);
    return null;
  }
}

export async function updateStudentInAirtable(recordId: string, data: Partial<StudentRecord['fields']>) {
  try {
    // Force is_update to true as per workflow requirements
    const updateData = {
      ...data,
      is_update: true
    };

    const record = await base(TABLE_NAME).update(recordId, updateData);
    return { success: true, record };
  } catch (error) {
    console.error('Error updating student in Airtable:', error);
    throw error;
  }
}

export async function updateEmailStatus(recordId: string, status: 'success' | 'fail') {
  try {
    const record = await base(TABLE_NAME).update(recordId, {
      is_email_sent: status
    });
    return { success: true, record };
  } catch (error) {
    console.error('Error updating email status in Airtable:', error);
    throw error;
  }
}
