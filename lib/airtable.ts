import Airtable from 'airtable';

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  throw new Error('Missing Airtable credentials');
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const TABLE_NAME = 'BillingInformation';

export interface StudentRecord {
  id: string; // Airtable Record ID
  fields: {
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
