import LogoutButton from './LogoutButton';
import { cookies } from 'next/headers';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-[#14213D] shadow-md relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {/* Using standard img tag to bypass image optimization issues on deployment */}
            <Image
              src="/limitless-logo-b.png"
              alt="Limitless Club Logo"
              width={100}
              height={60}
              className="object-contain bg-white/10"
            />
            <span className="text-white font-semibold text-xl tracking-wide uppercase">
              Limitless Club
            </span>
          </div>
          {cookies().get('limitless_session') && (
            <div className="flex items-center">
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
