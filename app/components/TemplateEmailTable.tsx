'use client';

import { TemplateEmailRecord } from '@/lib/airtable';
import { formatDate } from '@/lib/utils';

interface TemplateEmailTableProps {
  templates: TemplateEmailRecord[];
}

export default function TemplateEmailTable({ templates }: TemplateEmailTableProps) {
  // Helper to safely render complex fields (like linked records or Airtable errors)
  const renderField = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      // If it's an Airtable error object { error: '...' }
      if (value.error) {
        return <span className="text-red-500">{value.error}</span>;
      }
      // Fallback for other objects
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-200/60">
      <div className="px-6 py-5 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">
          Template Email ทั้งหมด ({templates.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Id</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Template</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Updated</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Is Active</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">YouTube</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Class Name</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {templates.length > 0 ? (
              templates.map((template) => (
                <tr key={template.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">
                    {template.fields.Id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {renderField(template.fields.Date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 max-w-xs overflow-hidden text-ellipsis">
                    <div className="line-clamp-2" title={template.fields.Template}>
                      {template.fields.Template || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {template.fields['Last Updated'] ? formatDate(template.fields['Last Updated']) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      template.fields['Is Active']
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {template.fields['Is Active'] ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {template.fields['Link Youtube'] ? (
                      <a href={template.fields['Link Youtube']} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Link
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {renderField(template.fields.class_name)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                  ไม่พบข้อมูล Template Email
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
