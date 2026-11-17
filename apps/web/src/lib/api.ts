import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8000/api/v1';

export async function proxyAuthRequest(
  endpoint: string,
  body: unknown,
  successStatus: number = 200,
  clearCookie: boolean = false,
) {
  try {
    const res = await fetch(`${API_URL}/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = res.status === 204 ? null : await res.json();

    if (!res.ok) {
      return NextResponse.json(data || { message: 'Request failed' }, { status: res.status });
    }

    const response = NextResponse.json(
      { accessToken: data?.accessToken },
      { status: successStatus },
    );

    const cookieStore = await cookies();

    if (clearCookie) {
      cookieStore.delete('nexus_refresh_token');
      cookieStore.delete('nexus_access_token');
    } else if (data?.refreshToken && data?.accessToken) {
      // Set Refresh Token (7 days)
      cookieStore.set('nexus_refresh_token', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      // Set Access Token (15 minutes)
      cookieStore.set('nexus_access_token', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 15,
      });
    }

    return response;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
