import Link from 'next/link';
import { getSession } from '@/lib/auth';

export async function Header() {
  const session = await getSession();

  return (
    <header className="border-b bg-white dark:bg-zinc-950 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Nexus
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Storefront
          </Link>

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
