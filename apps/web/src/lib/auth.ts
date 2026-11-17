import { headers } from 'next/headers';

export interface UserSession {
  sub: string;
  email: string;
  role: string;
}

export async function getSession(): Promise<UserSession | null> {
  const headersList = await headers();
  const token = headersList.get('x-access-token');

  if (!token) return null;

  try {
    // Decode the JWT payload (middle part)
    const payloadBase64 = token.split('.')[1];
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    return JSON.parse(decodedJson) as UserSession;
  } catch {
    return null;
  }
}
