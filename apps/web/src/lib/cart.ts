import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { randomUUID } from 'node:crypto';

export async function getOrCreateCartId(): Promise<{ cartId: string; isNewGuest: boolean }> {
  const session = await getSession();
  if (session) {
    return { cartId: session.sub, isNewGuest: false };
  }

  const cookieStore = await cookies();
  let guestId = cookieStore.get('guest-cart-id')?.value;

  if (!guestId) {
    guestId = randomUUID();
    return { cartId: guestId, isNewGuest: true };
  }

  return { cartId: guestId, isNewGuest: false };
}
