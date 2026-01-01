'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { useSidebar } from '@/contexts/SidebarContext';

interface HeaderProps {
  onAddClick?: () => void;
  addButtonText?: string;
  showAddButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onAddClick,
  addButtonText = '+ Add Item',
  showAddButton = true,
}) => {
  const { user, logout } = useAuth();
  const { openSidebar } = useSidebar();

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 bg-white border-b border-gray-200 px-4 lg:px-6 py-4 z-30">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={openSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Open sidebar"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#268700] text-sm lg:text-base"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* User Greeting - Hidden on small screens */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-gray-700 text-sm lg:text-base">Hello, {user?.first_name || 'User'}</span>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#268700] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm lg:text-base">
                {user?.first_name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>

          {/* Add Button */}
          {showAddButton && onAddClick && (
            <Button onClick={onAddClick} variant="primary" className="text-xs lg:text-sm px-3 lg:px-4">
              <span className="hidden sm:inline">{addButtonText}</span>
              <span className="sm:hidden">+</span>
            </Button>
          )}

          {/* Logout Button */}
          <Button onClick={logout} variant="outline" size="sm" className="text-[10px] sm:text-xs lg:text-sm">
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

