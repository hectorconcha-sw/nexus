import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  const session = await getSession();

  // If middleware didn't find a token, redirect to login
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 border-b dark:border-zinc-800 pb-2">
          Profile Information
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-zinc-500">User ID</p>
            <p className="font-mono text-sm">{session.sub}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Email</p>
            <p>{session.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Role</p>
            <p className="capitalize">{session.role.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
