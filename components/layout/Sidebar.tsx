'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import logo from '@/public/logo_partyfud.svg'
import Image from 'next/image';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems, isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-white flex flex-col border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo and Close Button */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
          <Image src={logo} alt="Party Fud Logo" className="w-32 h-auto" />
          {/* Close Button - Only visible on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Close sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      // Close sidebar on mobile when navigating
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#268700] text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

