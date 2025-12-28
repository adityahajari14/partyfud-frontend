'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect based on user type
        if (user.type === 'CATERER') {
          router.replace('/caterer/dashboard');
        } else if (user.type === 'USER') {
          router.replace('/user/dashboard');
        } else if (user.type === 'ADMIN') {
          router.replace('/admin/dashboard');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700]"></div>
    </div>
  );
}
