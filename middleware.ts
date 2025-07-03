import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Define types for better type safety
type UserRole = 'admin' | 'user'
type ProtectedRoutes = Record<string, UserRole>

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  console.time('middleware_execution')
  console.time('middleware_get_user')
  const { data: { user } } = await supabase.auth.getUser()
  console.timeEnd('middleware_get_user')

  // Define protected routes and their required roles with proper typing
  const protectedRoutes: ProtectedRoutes = {
    '/admin/dashboard': 'admin',
    '/users/dashboard': 'user',
    '/users/chat': 'user',
  }

  const currentPath = request.nextUrl.pathname

  // Check if the current path is a protected route
  const matchedRoute = Object.keys(protectedRoutes).find(route => currentPath.startsWith(route))
  const requiredRole = matchedRoute ? protectedRoutes[matchedRoute] : null

  if (requiredRole) {
    if (!user) {
      // No user session, redirect to login page based on route
      if (currentPath.startsWith('/admin')) {
        console.log('Middleware: No user, redirecting to /admin login')
        console.timeEnd('middleware_execution')
        return NextResponse.redirect(new URL('/admin', request.url))
      } else if (currentPath.startsWith('/users')) {
        console.log('Middleware: No user, redirecting to /users login')
        console.timeEnd('middleware_execution')
        return NextResponse.redirect(new URL('/users', request.url))
      }
    } else {
      // User is logged in, now check their role
      console.time('middleware_check_role_protected')
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      console.timeEnd('middleware_check_role_protected')

      if (userError || !userData || userData.role !== requiredRole) {
        // User does not have the required role, redirect to appropriate login or unauthorized page
        console.warn(`Middleware: Unauthorized access attempt: User ${user.id} with role ${userData?.role} tried to access ${currentPath} (requires ${requiredRole})`)
        if (currentPath.startsWith('/admin')) {
          console.timeEnd('middleware_execution')
          return NextResponse.redirect(new URL('/admin', request.url))
        } else if (currentPath.startsWith('/users')) {
          console.timeEnd('middleware_execution')
          return NextResponse.redirect(new URL('/users', request.url))
        }
        // Fallback for other protected routes if roles don't match
        console.timeEnd('middleware_execution')
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  } else {
    // If user is logged in and tries to access login pages, redirect to dashboard
    if (user) {
      if (currentPath === '/admin' || currentPath === '/admin/') {
        console.time('middleware_check_role_admin_login_redirect')
        const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
        console.timeEnd('middleware_check_role_admin_login_redirect')
        if (userData?.role === 'admin') {
          console.log('Middleware: Admin logged in, redirecting from /admin to /admin/dashboard')
          console.timeEnd('middleware_execution')
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
      } else if (currentPath === '/users' || currentPath === '/users/') {
        console.time('middleware_check_role_user_login_redirect')
        const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
        console.timeEnd('middleware_check_role_user_login_redirect')
        if (userData?.role === 'user') {
          console.log('Middleware: User logged in, redirecting from /users to /users/dashboard')
          console.timeEnd('middleware_execution')
          return NextResponse.redirect(new URL('/users/dashboard', request.url))
        }
      }
    }
  }

  console.log('Middleware: Proceeding with request')
  console.timeEnd('middleware_execution')
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.png (logo file)
     * - icons (PWA icons)
     * - api (Next.js API routes)
     * - test (test routes)
     * - offline (PWA offline fallback)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png|icons|api|test|offline).*)',
  ],
}
