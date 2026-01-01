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
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                        <p className="text-gray-600">Welcome to your catering dashboard</p>
                    </div>

                    {/* KPI CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: 'Total Orders', value: '1,275', trend: '+4%' },
                            { title: 'Platform Revenue', value: 'AED 25K', trend: '+5%' },
                            { title: 'Active Caterers', value: '2345', trend: '+1%' },
                            { title: 'Avg. Order Value', value: 'AED 23', trend: '-3%', danger: true },
                        ].map((kpi) => (
                            <div key={kpi.title} className="bg-white rounded-xl p-4 shadow-sm border">
                                <p className="text-sm text-gray-500">{kpi.title}</p>
                                <p className="text-2xl font-bold">{kpi.value}</p>
                                <p
                                    className={`text-xs mt-1 ${kpi.danger ? 'text-red-500' : 'text-green-600'
                                        }`}
                                >
                                    {kpi.trend} (30 days)
                                </p>
                            </div>
                        ))}
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
                                <div className="w-40 h-40 rounded-full border-16 border-green-600 relative">
                                    <div className="absolute inset-0 border-16 border-yellow-400 rotate-45 rounded-full" />
                                </div>

                                <ul className="text-sm space-y-2">
                                    <li className="flex items-center gap-2">
                                        <span className="w-3 h-3 bg-green-600 rounded-full" /> Arabic
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-3 h-3 bg-lime-400 rounded-full" /> Spanish
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-3 h-3 bg-yellow-400 rounded-full" /> Mandarin
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-3 h-3 bg-gray-300 rounded-full" /> Swahili
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* LOWER GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Revenue by City */}
                        <div className="bg-white rounded-xl p-5 border shadow-sm">
                            <h3 className="font-semibold mb-4">Revenue by City</h3>
                            <div className="flex items-end gap-6 h-40">
                                {[48, 56, 32, 18, 8].map((h, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                        <div
                                            className="w-6 bg-green-600 rounded"
                                            style={{ height: `${h * 2}px` }}
                                        />
                                        <span className="text-xs text-gray-500">
                                            {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Others'][i]}
                                        </span>
                                    </div>
                                ))}
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
                                <div className="flex justify-between">
                                    <span>Abu Dhabi</span>
                                    <span className="text-green-600 font-semibold">45 Orders</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Dubai</span>
                                    <span className="text-green-600 font-semibold">30 Orders</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sharjah</span>
                                    <span className="text-green-600 font-semibold">22 Orders</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </>
    );
}

