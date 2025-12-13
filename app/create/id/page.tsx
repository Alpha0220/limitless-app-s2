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
    <div className="min-h-screen bg-slate-50 relative isolate overflow-hidden flex flex-col">
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
            {refid && (
              <div className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                REF: {refid}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Subtle Background Gradients */}
      <div
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] bg-gradient-to-bl from-purple-100/40 to-pink-100/40 rounded-full blur-3xl -z-10"
        aria-hidden="true"
      />

      <main className="flex-grow w-full max-w-5xl mx-auto py-4 px-3 sm:px-6 relative z-10">
        <StudentList students={students} />
      </main>

      <footer className="py-4 text-center bg-slate-50 border-t border-slate-200/50">
        <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} Limitless Club. All rights reserved.</p>
      </footer>
    </div>
  );
}
