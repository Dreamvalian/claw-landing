import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // dashboard.ko4lax.dev -> serve dashboard at /
  if (host === 'dashboard.ko4lax.dev') {
    // Already at /, pass through to page.tsx
    return NextResponse.next()
  }

  // ko4lax.dev or www.ko4lax.dev -> redirect / to /home
  if (host === 'ko4lax.dev' || host === 'www.ko4lax.dev') {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
