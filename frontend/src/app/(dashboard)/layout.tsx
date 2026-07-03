import { redirect } from 'next/navigation';
import { backendFetch } from '@/lib/backend-fetch';
import { LogoutButton } from '@/components/logout-button';
import type { AuthUser } from '@/types/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const response = await backendFetch('/users/me');

  if (!response.ok) {
    redirect('/login');
  }

  const user = (await response.json()) as AuthUser;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b bg-background px-6 py-4">
        <div>
          <p className="text-sm font-semibold">FiscalFlow</p>
          <p className="text-xs text-muted-foreground">
            {user.name} · {user.role}
          </p>
        </div>
        <LogoutButton />
      </header>
      <main className="flex flex-1 flex-col px-6 py-8">{children}</main>
    </div>
  );
}
