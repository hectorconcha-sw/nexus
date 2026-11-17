import { proxyAuthRequest } from '@/lib/api';

export async function POST(req: Request) {
  const body = await req.json();
  return proxyAuthRequest('login', body, 200);
}
