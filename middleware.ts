import { NextResponse, type NextRequest } from 'next/server'
import { verifyOwnerToken, AUTH_COOKIE } from '@/lib/auth/cognito'

export async function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/admin/login'
  const isOwner = await verifyOwnerToken(request.cookies.get(AUTH_COOKIE)?.value)

  if (!isLoginPage && !isOwner) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  if (isLoginPage && isOwner) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
