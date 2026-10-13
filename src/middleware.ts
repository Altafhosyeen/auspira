import { withAuth } from 'next-auth/middleware';
import { PROTECTED_ROUTES } from '@/constants/routes.constants';

export default withAuth(
  function middleware() {
    // Allow all requests to pass through
    // NextAuth will handle redirects based on auth status
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Protected routes come from the shared constant — when adding a new
        // protected route, update PROTECTED_ROUTES and the matcher below.
        const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
          route === '/' ? req.nextUrl.pathname === '/' : req.nextUrl.pathname.startsWith(route)
        );

        // If route is protected, require token
        if (isProtectedRoute) {
          return !!token;
        }

        // Public routes don't require token
        return true;
      },
    },
    pages: {
      signIn: '/login',
      error: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/',
    '/projects/:path*',
    '/users/:path*',
    '/finance/:path*',
    '/welcome-back/:path*',
    '/settings/:path*',
    '/contract-control-agent/:path*',
    '/operational-control-agent/:path*',
    // Public routes like /login are excluded
  ],
};
