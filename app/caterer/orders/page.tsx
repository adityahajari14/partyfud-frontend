'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';

export default function OrdersPage() {
  return (
    <>
      <Header showAddButton={false} />
      <main className="flex-1 p-4 lg:p-6 pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
          <p className="text-gray-600 mb-6">View and manage your orders</p>

          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">Orders page coming soon</p>
          </div>
        </div>
      </main>
    </>
  );
}

