'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    name: 'Dashboard',
    href: '/caterer/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    name: 'Menus',
    href: '/caterer/menus',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    name: 'Packages',
    href: '/caterer/packages',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    name: 'Orders',
    href: '/caterer/orders',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

export default function CatererLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

const isDetailsPage = pathname === '/caterer/details';
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.type !== 'CATERER') {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700]"></div>
      </div>
    );
  }

  if (!user || user.type !== 'CATERER') {
    return null;
  }

  return isDetailsPage ? (
  // 👉 NO SIDEBAR LAYOUT (for /caterer/details)
  <div className="min-h-screen">
    {children}
  </div>
) : (
  // 👉 NORMAL CATERER DASHBOARD LAYOUT
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar navItems={navItems} />
    <div className="flex-1 flex flex-col ml-64">
      {children}
    </div>
  </div>
);
}

