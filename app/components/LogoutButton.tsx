'use client';

import { handleLogout } from '@/actions/auth';

export default function LogoutButton() {
  return (
    <button
      onClick={() => handleLogout()}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5 hover:border-white/10"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      ออกจากระบบ
    </button>
  );
}
