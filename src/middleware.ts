import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const protectedRoutes = ['/dashboard']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is a protected route
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
