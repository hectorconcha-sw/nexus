import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('nexus_refresh_token')?.value;

  if (refreshToken) {
    const apiUrl = process.env.API_URL || 'http://localhost:8000/api/v1';
    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Failed to revoke token at Kong', error);
    }
  }

  cookieStore.delete('nexus_refresh_token');
  cookieStore.delete('nexus_access_token');

  return NextResponse.redirect(new URL('/', req.url));
}
