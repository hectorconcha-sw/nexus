import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { getOrCreateCartId } from '@/lib/cart';

export async function GET() {
  const { cartId, isNewGuest } = await getOrCreateCartId();

  try {
    const res = await fetch(`${config.apiUrl}/cart`, {
      headers: { 'x-cart-id': cartId },
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    const response = NextResponse.json(data);

    if (isNewGuest) {
      response.cookies.set('guest-cart-id', cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 604800,
      });
    }
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}
