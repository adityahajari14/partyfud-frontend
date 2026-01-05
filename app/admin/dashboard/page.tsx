'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { adminApi } from '@/lib/api/admin.api';

interface AdminStats {
    totalOrders: number;
    platformRevenue: number;
    activeCaterers: number;
    avgOrderValue: number;
    pendingCaterers: number;
    approvedCaterers: number;
    rejectedCaterers: number;
    blockedCaterers: number;
    revenueByCity: { city: string; revenue: number }[];
    ordersByCuisine: { cuisine: string; orders: number; color: string }[];
    demandHotspots: { location: string; orders: number }[];
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            // Fetch all caterer info
            const response = await adminApi.getCatererInfo();
            
            if (response.data && response.data.data) {
                const caterers = response.data.data;
                
                // Calculate stats from caterer data
                const pending = caterers.filter(c => c.status === 'PENDING').length;
                const approved = caterers.filter(c => c.status === 'APPROVED').length;
                const rejected = caterers.filter(c => c.status === 'REJECTED').length;
                const blocked = caterers.filter(c => c.status === 'BLOCKED').length;
                
                // Group by region
                const regionCounts: { [key: string]: number } = {};
                caterers.forEach(c => {
                    const region = c.region || 'Unknown';
                    regionCounts[region] = (regionCounts[region] || 0) + 1;
                });
                
                const revenueByCity = Object.entries(regionCounts)
                    .map(([city, count]) => ({ city, revenue: count }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5);
                
                // Mock data for charts (since backend doesn't provide order data for admin)
                setStats({
                    totalOrders: approved * 5, // Estimate: 5 orders per approved caterer
                    platformRevenue: approved * 25000, // Estimate: 25K per caterer
                    activeCaterers: approved,
                    avgOrderValue: 23,
                    pendingCaterers: pending,
                    approvedCaterers: approved,
                    rejectedCaterers: rejected,
                    blockedCaterers: blocked,
                    revenueByCity,
                    ordersByCuisine: [
                        { cuisine: 'Arabic', orders: 45, color: 'bg-green-600' },
                        { cuisine: 'Spanish', orders: 30, color: 'bg-lime-400' },
                        { cuisine: 'Mandarin', orders: 15, color: 'bg-yellow-400' },
                        { cuisine: 'Swahili', orders: 10, color: 'bg-gray-300' },
                    ],
                    demandHotspots: revenueByCity.slice(0, 3).map(r => ({
                        location: r.city,
                        orders: r.revenue * 10
                    }))
                });
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
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                        <p className="text-gray-600">Welcome to your catering dashboard</p>
                    </div>

                    {/* KPI CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <p className="text-sm text-gray-500">Total Orders</p>
                            <p className="text-2xl font-bold">{stats?.totalOrders.toLocaleString() || '0'}</p>
                            <p className="text-xs mt-1 text-green-600">Estimated</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <p className="text-sm text-gray-500">Platform Revenue</p>
                            <p className="text-2xl font-bold">AED {((stats?.platformRevenue || 0) / 1000).toFixed(0)}K</p>
                            <p className="text-xs mt-1 text-green-600">Estimated</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <p className="text-sm text-gray-500">Active Caterers</p>
                            <p className="text-2xl font-bold">{stats?.activeCaterers || '0'}</p>
                            <p className="text-xs mt-1 text-gray-600">Approved</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <p className="text-sm text-gray-500">Avg. Order Value</p>
                            <p className="text-2xl font-bold">AED {stats?.avgOrderValue || '0'}</p>
                            <p className="text-xs mt-1 text-gray-600">Estimated</p>
                        </div>
                    </div>

                    {/* CHARTS ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Orders & GMV */}
                        <div className="bg-white rounded-xl p-5 border shadow-sm">
                            <h3 className="font-semibold mb-3">Orders & GMV Trends</h3>
                            <svg viewBox="0 0 500 200" className="w-full h-48">
                                <path
                                    d="M0,150 C80,90 120,100 180,70 240,40 300,50 360,120 420,150 460,130 500,110"
                                    fill="none"
                                    stroke="#268700"
                                    strokeWidth="3"
                                />
                                <circle cx="300" cy="120" r="5" fill="#268700" />
                                <line
                                    x1="300"
                                    y1="0"
                                    x2="300"
                                    y2="200"
                                    stroke="#268700"
                                    strokeDasharray="4"
                                />
                            </svg>
                            <p className="text-xs text-green-700 bg-green-100 inline-block px-2 py-1 rounded">
                                AED 12,657
                            </p>
                        </div>

                        {/* Orders by Cuisine */}
                        <div className="bg-white rounded-xl p-5 border shadow-sm">
                            <div className="flex justify-between mb-4">
                                <h3 className="font-semibold">Orders by Cuisine</h3>
                                <select className="text-sm border rounded px-2 py-1">
                                    <option>Monthly</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="relative w-40 h-40">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        {stats?.ordersByCuisine && (() => {
                                            const total = stats.ordersByCuisine.reduce((sum, item) => sum + item.orders, 0);
                                            let currentAngle = 0;
                                            const colors = ['#268700', '#84cc16', '#facc15', '#d1d5db'];
                                            
                                            return stats.ordersByCuisine.map((item, idx) => {
                                                const percentage = (item.orders / total) * 100;
                                                const angle = (percentage / 100) * 360;
                                                const startAngle = currentAngle;
                                                currentAngle += angle;
                                                
                                                const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
                                                const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
                                                const x2 = 50 + 45 * Math.cos((currentAngle * Math.PI) / 180);
                                                const y2 = 50 + 45 * Math.sin((currentAngle * Math.PI) / 180);
                                                const largeArc = angle > 180 ? 1 : 0;
                                                
                                                return (
                                                    <path
                                                        key={idx}
                                                        d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                                        fill={colors[idx]}
                                                    />
                                                );
                                            });
                                        })()}
                                    </svg>
                                </div>

                                <ul className="text-sm space-y-2">
                                    {stats?.ordersByCuisine.map((item, idx) => {
                                        const colors = ['bg-green-600', 'bg-lime-400', 'bg-yellow-400', 'bg-gray-300'];
                                        return (
                                            <li key={idx} className="flex items-center gap-2">
                                                <span className={`w-3 h-3 ${colors[idx]} rounded-full`} /> {item.cuisine}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* LOWER GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Revenue by City */}
                        <div className="bg-white rounded-xl p-5 border shadow-sm">
                            <h3 className="font-semibold mb-4">Caterers by City</h3>
                            <div className="flex items-end gap-6 h-40">
                                {stats?.revenueByCity.slice(0, 5).map((city, i) => {
                                    const maxRevenue = Math.max(...(stats?.revenueByCity.map(c => c.revenue) || [1]));
                                    const height = (city.revenue / maxRevenue) * 120;
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                            <div
                                                className="w-full bg-green-600 rounded"
                                                style={{ height: `${height}px` }}
                                            />
                                            <span className="text-xs text-gray-500 text-center">
                                                {city.city.substring(0, 10)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quality & Risk */}
                        <div className="bg-white rounded-xl p-5 border shadow-sm">
                            <h3 className="font-semibold mb-4">Quality & Risk Indicators</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-gray-500">Avg Rating</p>
                                    <p className="text-xl font-bold text-green-600">4.6</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Cancellation</p>
                                    <p className="text-xl font-bold text-orange-500">1.2%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Refund</p>
                                    <p className="text-xl font-bold text-red-500">1.2%</p>
                                </div>
                            </div>
                        </div>

                        {/* Demand Hotspots */}
                        <div className="bg-white rounded-xl p-5 border shadow-sm">
                            <h3 className="font-semibold mb-4">Demand Hotspots</h3>
                            <div className="space-y-2">
                                {stats?.demandHotspots.map((hotspot, idx) => (
                                    <div key={idx} className="flex justify-between">
                                        <span>{hotspot.location}</span>
                                        <span className="text-green-600 font-semibold">{hotspot.orders} Orders</span>
                                    </div>
                                ))}
                                {(!stats?.demandHotspots || stats.demandHotspots.length === 0) && (
                                    <p className="text-gray-400 text-sm">No data available</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </>
    );
}

