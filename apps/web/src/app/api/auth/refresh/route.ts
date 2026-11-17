import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { proxyAuthRequest } from '@/lib/api';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('nexus_refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token provided' }, { status: 401 });
  }

  return proxyAuthRequest('refresh', { refreshToken }, 200);
}
