import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper to decode JWT and check expiration (uses atob for Edge compatibility)
function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    const payload = JSON.parse(jsonPayload);
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('nexus_access_token')?.value;
  const refreshToken = request.cookies.get('nexus_refresh_token')?.value;
  const requestHeaders = new Headers(request.headers);

  // 1. If we have a valid Access Token, just pass it down.
  if (accessToken && !isTokenExpired(accessToken)) {
    requestHeaders.set('x-access-token', accessToken);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 2. If no Access Token (or it's expired), use Refresh Token to get a new one.
  if (refreshToken) {
    try {
      const apiUrl = process.env.API_URL || 'http://localhost:8000/api/v1';
      const res = await fetch(`${apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          requestHeaders.set('x-access-token', data.accessToken);
          const response = NextResponse.next({ request: { headers: requestHeaders } });

          // Update both cookies
          if (data.refreshToken) {
            response.cookies.set('nexus_refresh_token', data.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              path: '/',
              maxAge: 604800,
            });
          }
          response.cookies.set('nexus_access_token', data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 900,
          });

          return response;
        }
      } else {
        // Refresh failed (revoked or stolen). Nuke cookies.
        const response = NextResponse.next();
        response.cookies.delete('nexus_refresh_token');
        response.cookies.delete('nexus_access_token');
        return response;
      }
    } catch (error) {
      console.error('Middleware refresh error:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
