'use server';

import { revalidatePath } from 'next/cache';
import { login, logout } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function handleLogin(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const callbackUrl = formData.get('callbackUrl') as string || '/';

  const success = await login(username, password);

  if (success) {
    redirect(callbackUrl);
  } else {
    return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
  }
}

export async function handleLogout() {
  await logout();
  revalidatePath('/');
  redirect('/login');
}
