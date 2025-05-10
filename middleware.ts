import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import requireAuth from './lib/auth';

export async function middleware(request: NextRequest) {
  // Protect dashboard and intel routes
  const protectedPaths = ['/dashboard', '/intel'];
  const path = request.nextUrl.pathname;

  if (protectedPaths.some(prefix => path.startsWith(prefix))) {
    const session = await requireAuth(request);
    
    if (!session) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/intel/:path*'],
};