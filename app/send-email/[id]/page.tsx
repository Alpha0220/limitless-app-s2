import { getStudentById } from '@/lib/airtable';
import SendEmailList from './SendEmailList';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
  
export default async function SendEmailPage({ params }: { params: { id: string } }) {
  const student = await getStudentById(params.id);
  const students = student ? [student] : [];

  return (
    <div className="min-h-screen bg-slate-50 relative isolate flex flex-col">


      {/* Background Gradients */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl -z-10" aria-hidden="true" />

      <main className="flex-grow w-full max-w-3xl mx-auto py-4 px-0 relative z-10">

        {/* Header */}
        <div className="mb-4">
          <Link href="/" className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            กลับหน้าหลัก
          </Link>
        </div>

        {/* List */}
        <SendEmailList students={students} />

      </main>
    </div>
  );
}
