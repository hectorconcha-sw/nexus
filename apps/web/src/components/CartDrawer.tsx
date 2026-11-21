'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/useCartStore';

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, getTotal, fetchCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors and fetch cart on mount
  useEffect(() => {
    setMounted(true);
    fetchCart();
  }, [fetchCart]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeCart();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-zinc-950 shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
          <h2 className="text-lg font-bold">Your Cart</h2>
          <button
            onClick={closeCart}
            className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p>Your cart is empty.</p>
              <Link href="/" onClick={closeCart} className="text-blue-600 hover:underline">
                Continue shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-4 py-4 border-b dark:border-zinc-800 last:border-0"
                >
                  <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-md flex-shrink-0" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-zinc-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="font-bold">${(item.priceCents / 100).toFixed(2)}</p>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t dark:border-zinc-800 p-4 space-y-4 bg-zinc-50 dark:bg-zinc-900">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>${(getTotal() / 100).toFixed(2)}</span>
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
