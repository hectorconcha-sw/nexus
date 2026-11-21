import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { getOrCreateCartId } from '@/lib/cart';

export async function DELETE(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const { cartId } = await getOrCreateCartId();

  try {
    const res = await fetch(`${config.apiUrl}/cart/items/${productId}`, {
      method: 'DELETE',
      headers: { 'x-cart-id': cartId },
    });

    if (!res.ok) throw new Error('Failed to remove item');

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
