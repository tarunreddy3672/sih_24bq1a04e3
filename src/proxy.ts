import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const secret = process.env.NEXTAUTH_SECRET || 'eduvision-sih-dev-secret-super-secure-key-2026';

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  // Not logged in — redirect to login for protected routes
  if (!token) {
    if (
      pathname.startsWith('/student') ||
      pathname.startsWith('/faculty') ||
      pathname.startsWith('/admin')
    ) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  const role = token.role as string;

  // Student trying to access faculty or admin
  if (role === 'student' && (pathname.startsWith('/faculty') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/student/dashboard', req.url));
  }

  // Faculty trying to access student or admin
  if (role === 'faculty' && (pathname.startsWith('/student') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/faculty/attendance', req.url));
  }

  // Admin trying to access student or faculty
  if (role === 'admin' && (pathname.startsWith('/student') || pathname.startsWith('/faculty'))) {
    return NextResponse.redirect(new URL('/admin/control-tower', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/faculty/:path*', '/admin/:path*'],
};
