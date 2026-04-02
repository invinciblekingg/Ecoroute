'use client';

import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  userRole?: 'admin' | 'worker' | 'citizen';
}

export function AppLayout({ children, userRole = 'citizen' }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar userRole={userRole} />
      <main className="flex-1 w-full lg:ml-0">
        {children}
      </main>
    </div>
  );
}
