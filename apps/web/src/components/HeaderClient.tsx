'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/useCartStore';
import { UserSession } from '@/lib/auth';

export function HeaderClient({ session }: { session: UserSession | null }) {
  const { openCart, items } = useCartStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="border-b bg-white dark:bg-zinc-950 dark:border-zinc-800 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Nexus
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Storefront
          </Link>

          <button
            onClick={openCart}
            className="relative p-2 text-zinc-600 hover:text-blue-600 transition-colors"
            aria-label="Open cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full">
                {itemCount}
              </span>
            )}
          </button>

          {session ? (
            <>
              <Link href="/account" className="text-zinc-500 hover:text-blue-600 transition-colors">
                Hi, {session.email.split('@')[0]}
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-zinc-500 hover:text-red-600 transition-colors"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-600 transition-colors">
                Log in
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
