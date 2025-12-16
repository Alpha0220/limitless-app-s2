import { getAllStudents } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

import { formatDate } from '@/lib/utils';

import CopyableText from '@/app/components/CopyableText';
import StudentTable from '@/app/components/StudentTable';
import Image from 'next/image';

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
              <Image
                src="/limitless-logo-b.png"
                alt="Limitless Club Logo"
                width={100}
                height={60}
                className="object-contain bg-white/10"
              />
              <span className="text-white font-semibold text-xl tracking-wide uppercase">Limitless Club</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-4 lg:py-6 px-4 sm:px-2 lg:px-2">

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8 lg:mb-8 text-center">
          {/* <h1 className="text-3xl font-bold text-slate-900 mb-6">ค้นหาข้อมูลนักเรียน</h1> */}
          <form action={searchAction} className="flex gap-2">
            <input
              type="text"
              name="refid"
              placeholder="กรอก Group ID (เช่น 1eb80-a4ba-4080-91e3)"
              className="flex-1 text-slate-900 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              ค้นหา
            </button>
          </form>
        </div>

        {/* Student List Table */}
        <StudentTable students={students} />

      </main>
    </div>
  );
}
