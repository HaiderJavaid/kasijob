import { NextResponse } from 'next/server';

export function middleware(request) {
  // 1. Get the path the user is trying to visit
  const path = request.nextUrl.pathname;

  // 2. Define Public Paths (Anyone can see these)
  // We include '/' (landing), '/login', '/register', and static assets
  const isPublicPath = path === '/' || path === '/login' || path === '/register';

  // 3. Check for Auth Token
  // Firebase auth tokens are usually stored in cookies if you set them up that way,
  // BUT for a client-side Firebase app, middleware can't easily see the auth state 
  // because Firebase Auth is client-side.
  
  // ALTERNATIVE STRATEGY FOR CLIENT-SIDE FIREBASE:
  // Since middleware runs on the server/edge, it doesn't know if `firebase.auth().currentUser` exists.
  // 
  // Ideally, you should handle protection inside `layout.js` or a `useAuth` hook for client-side apps.
  // However, we can use a "Session Cookie" approach if you implemented session cookies.
  
  // FOR NOW (Simpler Client-Side Protection):
  // We will rely on the `useEffect` redirects inside your pages (which you already have).
  // 
  // IF you want true Middleware protection, you need to set a cookie upon login.
  // Assuming you might set a cookie named 'kasi_auth' when they log in:
  
  const token = request.cookies.get('kasi_auth')?.value || '';

  // 4. Redirect Logic
  // If trying to visit protected page AND no token -> Redirect to Login
  if (!isPublicPath && !token) {
    // Exclude static files (images, _next) from redirection
    if (!path.startsWith('/_next') && !path.startsWith('/favicon.ico') && !path.includes('.')) {
       return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If visiting login/register BUT already has token -> Redirect to Profile/Tasks
  if (isPublicPath && token && path !== '/') {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }
}

// 5. Matcher Config
export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/tasks',
    '/jobs',
    '/leaderboard',
    '/profile',
    '/admin/:path*'
  ],
};