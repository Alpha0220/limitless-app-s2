import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'limitless_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function login(username: string, password: string) {
  const envUsername = process.env.USER_NAME;
  const envPassword = process.env.PASSWORD_APP;

  if (username === envUsername && password === envPassword) {
    const expiresAt = new Date(Date.now() + SESSION_DURATION);
    
    // In a real app, you'd use a JWT or session ID stored in a DB.
    // For this simple case, we'll use a static "authenticated" token.
    // In a production app, this should be a signed JWT.
    const sessionToken = btoa(JSON.stringify({ username, expires: expiresAt.getTime() }));

    cookies().set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });

    return true;
  }

  return false;
}

export function logout() {
  cookies().set(SESSION_COOKIE_NAME, '', { expires: new Date(0), path: '/' });
}

export function getSession() {
  const session = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!session) return null;

  try {
    const decoded = JSON.parse(atob(session));
    if (decoded.expires < Date.now()) {
      return null;
    }
    return decoded;
  } catch (e) {
    return null;
  }
}

export function isAuthenticated(req?: NextRequest) {
  const session = req 
    ? req.cookies.get(SESSION_COOKIE_NAME)?.value 
    : cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!session) return false;

  try {
    const decoded = JSON.parse(atob(session));
    return decoded.expires > Date.now();
  } catch (e) {
    return false;
  }
}
