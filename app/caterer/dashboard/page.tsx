'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { catererApi, DashboardStats } from '@/lib/api/caterer.api';

export default function CatererDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await catererApi.getDashboardStats();
      if (response.data) {
        const data = response.data as any;
        if (data.data) {
          setStats(data.data);
        } else {
          setStats(data);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }> = ({ title, value, subtitle, icon, color, bgColor }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${bgColor} ${color} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const RecentItemCard: React.FC<{
    name: string;
    imageUrl: string | null;
    price: number;
    currency: string;
    status?: boolean;
    onClick?: () => void;
  }> = ({ name, imageUrl, price, currency, status, onClick }) => {
    const [imageError, setImageError] = React.useState(false);
    const fallbackImage = `https://source.unsplash.com/100x100/?food,${encodeURIComponent(name || 'delicious')}`;

    return (
      <div
        onClick={onClick}
        className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <img
              src={fallbackImage}
              alt={name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{name}</h4>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm font-medium text-gray-700">
              {currency} {price.toFixed(2)}
            </p>
            {status !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${status
                    ? 'bg-[#e8f5e0] text-[#1a5a00]'
                    : 'bg-gray-100 text-gray-600'
                  }`}
              >
                {status ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Header showAddButton={false} />
        <main className="flex-1 p-6 pt-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700]"></div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header showAddButton={false} />
      <main className="flex-1 p-6 pt-24 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome to your catering dashboard</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">


            <StatCard
              title="Total Dishes"
              value={stats?.dishes.total || 0}
              subtitle={`${stats?.dishes.active || 0} active`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              title="Total Packages"
              value={stats?.packages.total || 0}
              subtitle={`${stats?.packages.available || 0} available`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
            <StatCard
              title="Package Items"
              value={stats?.packageItems.total || 0}
              subtitle={`${stats?.packageItems.draft || 0} draft`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              title="Revenue Potential"
              value={`${stats?.financial.currency || 'AED'} ${(stats?.financial.totalRevenuePotential || 0).toLocaleString()}`}
              subtitle={`Avg: ${stats?.financial.currency || 'AED'} ${(stats?.financial.averagePackagePrice || 0).toFixed(2)}`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="text-amber-600"
              bgColor="bg-amber-50"
            />
          </div>
          {/* Revenue & Traffic Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Revenue */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Revenue</h2>
              </div>

              <div className="relative h-56">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
                  <span>60K</span>
                  <span>50K</span>
                  <span>40K</span>
                  <span>30K</span>
                  <span>20K</span>
                  <span>10K</span>
                 
                </div>

                {/* SVG Line Chart */}
                <svg viewBox="0 0 500 200" className="ml-8 w-full h-full">
                  <path
                    d="M0,140 
             C50,80 100,90 150,60 
             C200,30 250,40 300,110 
             C350,150 400,120 450,100"
                    fill="none"
                    stroke="#268700"
                    strokeWidth="2"
                  />

                  {/* Highlight Point */}
                  <circle cx="300" cy="110" r="4" fill="#268700" />
                  <line
                    x1="300"
                    y1="0"
                    x2="300"
                    y2="200"
                    stroke="#268700"
                    strokeDasharray="4"
                  />

                  {/* Tooltip */}
                  <g transform="translate(310,100)">
                    <rect width="90" height="26" rx="6" fill="#e8f5e0" />
                    <text x="8" y="17" fontSize="12" fill="#1a5a00">
                      AED 12,657
                    </text>
                  </g>
                </svg>

                {/* X-axis */}
                <div className="flex justify-between text-xs text-gray-400 mt-2 ml-8">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Traffic */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Traffic</h2>
                <select className="text-sm border rounded px-2 py-1">
                  <option>Monthly</option>
                </select>
              </div>

              {/* CHART WRAPPER */}
              <div className="relative h-56">

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
                  <span>60K</span>
                  <span>50K</span>
                  <span>40K</span>
                  <span>30K</span>
                  <span>20K</span>
                  <span>10K</span>
                  
                </div>

                {/* Bars */}
                <div className="ml-8 h-full flex items-end gap-6 px-6">
                  {[
                    { color: 'bg-[#268700]', h: 150 },
                    { color: 'bg-red-400', h: 100 },
                    { color: 'bg-red-400', h: 100 },
                    { color: 'bg-red-400', h: 100 },
                    { color: 'bg-[#268700]', h: 180 },
                    { color: 'bg-yellow-400', h: 130 },
                    { color: 'bg-red-400', h: 100 },
                    { color: 'bg-red-400', h: 100 },
                    { color: 'bg-[#268700]', h: 180 },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div
                        className={`w-4 rounded ${bar.color}`}
                        style={{ height: bar.h }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* X-axis */}
              <div className="ml-8 flex justify-between text-xs text-gray-400 mt-2 px-6">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map(m => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>


          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Dishes Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dishes Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Active Dishes</span>
                  <span className="text-lg font-bold text-blue-600">{stats?.dishes.active || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Inactive Dishes</span>
                  <span className="text-lg font-bold text-gray-600">{stats?.dishes.inactive || 0}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={() => router.push('/caterer/menus')}
                    className="w-full text-sm font-medium text-[#268700] hover:text-[#1f6b00] transition-colors"
                  >
                    View All Dishes →
                  </button>
                </div>
              </div>
            </div>

            {/* Packages Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Packages Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Available Packages</span>
                  <span className="text-lg font-bold text-purple-600">{stats?.packages.available || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Inactive Packages</span>
                  <span className="text-lg font-bold text-gray-600">{stats?.packages.inactive || 0}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={() => router.push('/caterer/packages')}
                    className="w-full text-sm font-medium text-[#268700] hover:text-[#1f6b00] transition-colors"
                  >
                    View All Packages →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Dishes */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Dishes</h2>
                <button
                  onClick={() => router.push('/caterer/menus')}
                  className="text-sm font-medium text-[#268700] hover:text-[#1f6b00] transition-colors"
                >
                  View All →
                </button>
              </div>
              {stats?.recent.dishes && stats.recent.dishes.length > 0 ? (
                <div className="space-y-3">
                  {stats.recent.dishes.map((dish) => (
                    <RecentItemCard
                      key={dish.id}
                      name={dish.name}
                      imageUrl={dish.image_url}
                      price={dish.price}
                      currency={dish.currency}
                      status={dish.is_active}
                      onClick={() => router.push(`/caterer/menus`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No dishes yet</p>
                  <button
                    onClick={() => router.push('/caterer/menus')}
                    className="mt-2 text-sm font-medium text-[#268700] hover:text-[#1f6b00] transition-colors"
                  >
                    Create Your First Dish →
                  </button>
                </div>
              )}
            </div>

            {/* Recent Packages */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Packages</h2>
                <button
                  onClick={() => router.push('/caterer/packages')}
                  className="text-sm font-medium text-[#268700] hover:text-[#1f6b00] transition-colors"
                >
                  View All →
                </button>
              </div>
              {stats?.recent.packages && stats.recent.packages.length > 0 ? (
                <div className="space-y-3">
                  {stats.recent.packages.map((pkg) => (
                    <RecentItemCard
                      key={pkg.id}
                      name={pkg.name}
                      imageUrl={pkg.cover_image_url}
                      price={pkg.total_price}
                      currency={pkg.currency}
                      status={pkg.is_available}
                      onClick={() => router.push(`/caterer/packages/${pkg.id}/edit`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No packages yet</p>
                  <button
                    onClick={() => router.push('/caterer/packages/create')}
                    className="mt-2 text-sm font-medium text-[#268700] hover:text-[#1f6b00] transition-colors"
                  >
                    Create Your First Package →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

