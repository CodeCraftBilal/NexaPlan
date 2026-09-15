import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define which routes are protected and require authentication
const protectedRoutes = ['/projects', '/tasks', '/workspaces', '/settings', '/dashboard']

// Define which routes are meant for unauthenticated users
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Check if the route is protected (starts with any of the protected routes)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Redirect to login if accessing a protected route without a token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to projects/dashboard if accessing an auth route while already logged in
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/projects', request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to only run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
