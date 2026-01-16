'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { usePathname } from 'next/navigation';
import { catererApi } from '@/lib/api/caterer.api';

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
    name: 'Profile',
    href: '/caterer/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
  {
    name: 'Proposals',
    href: '/caterer/proposal',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

function CatererLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();
  const router = useRouter();
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);

  // Close sidebar when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        closeSidebar();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeSidebar]);

  // Handle authentication and redirects
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.type !== 'CATERER') {
        // Allow users who just submitted their caterer application
        // They should be redirected to login only if they're not a caterer type
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && user.type === 'CATERER') {
      // Fetch approval status whenever user changes (regardless of profile_completed)
      fetchApprovalStatus();
    }
  }, [user, loading]);

  const fetchApprovalStatus = async () => {
    try {
      const response = await catererApi.getCatererInfo();
      console.log('Caterer info response:', response);
      
      // The backend returns { success: true, data: catererInfo }
      // apiRequest wraps it, so response.data is the whole backend response
      const catererData = response.data as any;
      
      if (catererData && catererData.success && catererData.data) {
        console.log('Setting approval status to:', catererData.data.status);
        setApprovalStatus(catererData.data.status);
      } else if (catererData && 'status' in catererData) {
        // Fallback: if the data is directly the catererInfo
        console.log('Setting approval status to (fallback):', catererData.status);
        setApprovalStatus(catererData.status);
      }
    } catch (error) {
      console.error('Error fetching approval status:', error);
    }
  };

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

  // Disable all navigation except Dashboard when approval is pending
  // Profile, Menus, Packages, Orders, Proposals should be disabled until approved
  const filteredNavItems = approvalStatus === 'PENDING' 
    ? navItems.map(item => ({
        ...item,
        disabled: item.name !== 'Dashboard'
      }))
    : navItems;

  console.log('Approval status:', approvalStatus, 'Filtered nav items:', filteredNavItems);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        navItems={filteredNavItems} 
        isOpen={isOpen}
        onClose={closeSidebar}
      />
      <div className="flex-1 flex flex-col w-full lg:ml-64 transition-all duration-300 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}

export default function CatererLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <CatererLayoutContent>{children}</CatererLayoutContent>
    </SidebarProvider>
  );
}

