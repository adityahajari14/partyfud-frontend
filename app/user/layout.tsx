'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

//   useEffect(() => {
//     if (!loading) {
//       if (!user || user.type !== 'USER') {
//         router.replace('/login');
//       }
//     }
//   }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#59c226]" />
      </div>
    );
  }

//   if (!user || user.type !== 'USER') {
//     return null;
//   }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer/>
    </div>
  );
}
