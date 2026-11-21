'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/useCartStore';

// 👇 Define the exact shape the button needs
interface AddToCartButtonProps {
  product: {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const { fetchCart, openCart } = useCartStore();

  const handleAdd = async () => {
    setLoading(true);
    try {
      await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceCents: product.priceCents,
          quantity: 1,
        }),
      });
      await fetchCart(); // Refresh cart state
      openCart(); // Slide out the drawer
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full md:w-auto disabled:opacity-50"
    >
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
