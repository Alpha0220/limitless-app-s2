import { getStudentsByReferenceId } from '@/lib/airtable';
import StudentList from './StudentList';

export default async function Page({ searchParams }: { searchParams: { refid?: string } }) {
  const refid = searchParams.refid;

  if (!refid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center p-8 bg-slate-900 rounded-2xl border border-red-500/20 shadow-xl">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Error</h1>
          <p className="text-slate-400">Reference ID is missing.</p>
        </div>
      </div>
    );
  }

  const students = await getStudentsByReferenceId(refid);

  if (students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center p-8 bg-slate-900 rounded-2xl border border-yellow-500/20 shadow-xl">
          <h1 className="text-2xl font-bold text-yellow-500 mb-2">Not Found</h1>
          <p className="text-slate-400">ไม่พบข้อมูลสำหรับ Reference ID: <code className="bg-slate-800 px-2 py-1 rounded text-white">{refid}</code></p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
        {/* Brand Header */}
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">Limitless Club</h2>
          <p className="text-slate-500 mt-2">ระบบจัดการข้อมูลนักเรียน</p>
        </div>

        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-lg font-semibold text-slate-700">รายการข้อมูลที่ต้องตรวจสอบ ({students.length})</h3>
          <div className="text-sm text-slate-500 font-mono">Ref: {refid}</div>
        </div>

        <StudentList students={students} />

        <footer className="mt-16 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Limitless Club. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
