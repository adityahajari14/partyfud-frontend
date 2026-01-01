'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export default function UserDashboardPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Redirect to login page after logout
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, redirect to login
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Button 
          onClick={handleLogout} 
          variant="primary" 
          size="lg"
          isLoading={isLoggingOut}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
