'use client';

import { useState, useMemo } from 'react';
import { StudentRecord } from '@/lib/airtable';
import { formatDate } from '@/lib/utils';
import CopyableText from '@/app/components/CopyableText';

interface StudentTableProps {
  students: StudentRecord[];
}

export default function StudentTable({ students }: StudentTableProps) {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Extract unique classes for the dropdown
  const uniqueClasses = useMemo(() => {
    const classes = students
      .map((s) => s.fields.name_class)
      .filter((c): c is string => !!c); // Filter out undefined/null
    return Array.from(new Set(classes)).sort();
  }, [students]);

  // Extract unique dates for the dropdown
  const uniqueDates = useMemo(() => {
    const dates = students
      .map((s) => formatDate(s.fields.date))
      .filter((d) => d !== '-'); // Exclude empty dates
    return Array.from(new Set(dates)).sort();
  }, [students]);

  // Filter students based on criteria
  const filteredStudents = useMemo(() => {
    // Require Class selection
    if (!selectedClass) return [];

    return students.filter((student) => {
      // Class filter
      if (selectedClass && student.fields.name_class !== selectedClass) {
        return false;
      }

      // Date filter (matches formatted date string)
      if (dateFilter) {
        const formattedDate = formatDate(student.fields.date);
        if (!formattedDate.includes(dateFilter)) {
          return false;
        }
      }

      return true;
    });
  }, [students, selectedClass, dateFilter]);

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-200/60">
      
      {/* Header with Filters */}
      <div className="px-6 py-5 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-semibold text-slate-800 shrink-0">
          รายชื่อนักเรียนทั้งหมด ({filteredStudents.length}/{students.length})
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Class Filter */}
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full sm:w-40 appearance-none bg-slate-50 border border-slate-300 text-slate-700 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
            >
              <option value="">เลือก Class</option>
              {uniqueClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Date Filter */}
          <div className="relative">
             <input
              type="text"
              list="date-options"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="(DD/MM/YYYY)"
              className="w-full sm:w-40 bg-slate-50 border border-slate-300 text-slate-900 py-2 px-3 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
            />
            <datalist id="date-options">
              {uniqueDates.map((date) => (
                <option key={date} value={date} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Group ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ชื่อเล่น</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">คลาส</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">วันที่</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">สถานะข้อมูล</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">สถานะอีเมล</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{student.fields.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {student.fields.uuid ? (
                      <CopyableText text={student.fields.uuid} />
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {student.fields.full_name_certificate || student.fields.full_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.fields.nickname || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.fields.name_class || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(student.fields.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.fields.is_update
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                      }`}>
                      {student.fields.is_update ? 'ส่งแล้ว' : 'ยังไม่ส่ง'}
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
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center text-slate-500">
                  {!selectedClass ? 'กรุณาเลือก Class เพื่อดูข้อมูล' : 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
