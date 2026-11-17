import { proxyAuthRequest } from '@/lib/api';

export async function POST(req: Request) {
  const body = await req.json();
  return proxyAuthRequest('register', body, 201);
}
