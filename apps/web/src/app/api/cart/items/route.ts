import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { getOrCreateCartId } from '@/lib/cart';

export async function POST(req: Request) {
  const body = await req.json();
  const { cartId, isNewGuest } = await getOrCreateCartId();

  try {
    const res = await fetch(`${config.apiUrl}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-cart-id': cartId },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('Failed to add');
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
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}
