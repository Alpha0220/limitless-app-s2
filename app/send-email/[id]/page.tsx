import { getStudentById } from '@/lib/airtable';
import SendEmailList from './SendEmailList';
import Link from 'next/link';

export default async function SendEmailPage({ params }: { params: { id: string } }) {
  const student = await getStudentById(params.id);
  const students = student ? [student] : [];

  return (
    <div className="min-h-screen bg-slate-50 relative isolate">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl -z-10" aria-hidden="true" />

      <main className="max-w-3xl mx-auto py-12 px-4">

        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            กลับหน้าหลัก
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <span className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </span>
            ส่งอีเมล
          </h1>
          {student && (
            <div className="mt-2 text-sm text-slate-500 flex items-center gap-2">
              <span>ผู้เรียน: <span className="font-semibold text-slate-700">{student.fields.full_name}</span></span>
              <span className="text-slate-300">•</span>
              <span>Ref ID: <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{student.fields.uuid}</span></span>
            </div>
          )}
        </div>

        {/* List */}
        <SendEmailList students={students} />

      </main>
    </div>
  );
}
