'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { handleLogin } from '@/actions/auth';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition duration-300 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          เข้าสู่ระบบ
          <svg 
            className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </>
      )}
    </button>
  );
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [state, formAction] = useFormState(handleLogin, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="w-full max-w-md px-6 relative z-10">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 px-8 pt-8 pb-4 sm:pt-10 sm:px-10 sm:pb-6 rounded-3xl sm:rounded-[2.5rem] shadow-2xl">
          {/* Logo / Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mb-3 sm:mb-4 shadow-xl shadow-indigo-500/20 transform -rotate-6">
              <span className="text-white text-xl sm:text-2xl font-bold italic">L</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-0.5 sm:mb-1">Limitless Club</h1>
            <p className="text-slate-400 text-xs sm:text-sm">Admin Authentication Portal</p>
          </div>

          <form action={formAction} className="space-y-3 sm:space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            
            <div className="space-y-1 sm:space-y-1.5">
              <label htmlFor="username" className="text-[10px] sm:text-xs font-medium text-slate-300 ml-1 cursor-pointer hover:text-white transition-colors">ชื่อผู้ใช้</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoFocus
                  placeholder="Username"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2 sm:py-2.5 pl-11 sm:pl-12 pr-4 text-xs sm:text-sm focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <label htmlFor="password" className="text-[10px] sm:text-xs font-medium text-slate-300 ml-1 cursor-pointer hover:text-white transition-colors">รหัสผ่าน</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2 sm:py-2.5 pl-11 sm:pl-12 pr-12 text-xs sm:text-sm focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-indigo-400 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.046m4.51-4.51A9.959 9.959 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-2.102-2.102L3 3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {state?.success === false && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-3 px-4 rounded-xl flex items-center gap-3 animate-shake">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {state.message}
              </div>
            )}

            <SubmitButton />
          </form>

          {/* Footer Decoration */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] sm:text-xs text-slate-500">
              © {new Date().getFullYear()} Limitless Club Team. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
