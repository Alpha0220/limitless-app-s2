import { getAllStudents } from '@/lib/airtable';
import { redirect } from 'next/navigation';

export default async function Home() {
  const students = await getAllStudents();

  async function searchAction(formData: FormData) {
    'use server';
    const refid = formData.get('refid');
    if (refid) {
      redirect(`/create/id?refid=${refid}`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 relative isolate overflow-hidden">
      {/* Background Gradients */}
      <div
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl -z-10"
        aria-hidden="true"
      />

      {/* Navbar */}
      <nav className="bg-slate-900 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-wide uppercase">Limitless Club</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-16 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">ค้นหาข้อมูลนักเรียน</h1>
          <form action={searchAction} className="flex gap-2">
            <input
              type="text"
              name="refid"
              placeholder="กรอก Reference ID (เช่น 2323)"
              className="flex-1 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              ค้นหา
            </button>
          </form>
        </div>

        {/* Student List Table */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-200/60">
          <div className="px-6 py-5 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">รายชื่อนักเรียนทั้งหมด ({students.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Group ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ชื่อเล่น</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">คลาส</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">สถานะข้อมูล</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">สถานะอีเมล</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{student.fields.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{student.fields.uuid}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.fields.full_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.fields.nickname || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.fields.name_class || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.fields.is_update
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                        }`}>
                        {student.fields.is_update ? 'ยืนยันแล้ว' : 'รอตรวจสอบ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.fields.is_email_sent === 'success' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 gap-1 items-center">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          ส่งแล้ว
                        </span>
                      )}
                      {student.fields.is_email_sent === 'fail' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 gap-1 items-center">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          ไม่สำเร็จ
                        </span>
                      )}
                      {(!student.fields.is_email_sent || student.fields.is_email_sent === 'pending') && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-500">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <a href={`/create/id?refid=${student.fields.uuid}`} className="text-slate-500 hover:text-indigo-600 px-3 py-1 rounded hover:bg-slate-50 transition-colors">
                          ดูข้อมูล
                        </a>
                        <a href={`/send-email/${student.id}`} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          ส่งเมล
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
