'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

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

  return (
    <header className="fixed top-0 left-64 right-0 bg-white border-b border-gray-200 px-6 py-4 z-20">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#268700]"
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
        <div className="flex items-center gap-4">
          {/* User Greeting */}
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Hello, {user?.first_name || 'User'}</span>
            <div className="w-10 h-10 bg-[#268700] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.first_name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>

          {/* Add Button */}
          {showAddButton && onAddClick && (
            <Button onClick={onAddClick} variant="primary">
              {addButtonText}
            </Button>
          )}

          {/* Logout Button */}
          <Button onClick={logout} variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

