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
    ordersAndGMV: Array<{
        month: string;
        year: number;
        orders: number;
        gmv: number;
        estimate: number;
    }>;
    ordersByCuisine: Array<{
        cuisine: string;
        orders: number;
        percentage: string;
        color: string;
    }>;
    avgRating: number;
    cancellationRate: number;
    refundRate: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [hoveredPoint, setHoveredPoint] = useState<{
        x: number;
        y: number;
        value: number;
        month: string;
        type: 'orders' | 'estimate';
    } | null>(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getDashboardStats();
            
            if (response.data && response.data.data) {
                setStats(response.data.data);
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
                            <p className="text-2xl font-bold flex items-center gap-1">
                                <img src="/dirham.svg" alt="AED" className="w-5 h-5" />
                                {((stats?.platformRevenue || 0) / 1000).toFixed(0)}K
                            </p>
                            <p className="text-xs mt-1 text-green-600">Estimated</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <p className="text-sm text-gray-500">Active Caterers</p>
                            <p className="text-2xl font-bold">{stats?.activeCaterers || '0'}</p>
                            <p className="text-xs mt-1 text-gray-600">Approved</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <p className="text-sm text-gray-500">Avg. Order Value</p>
                            <p className="text-2xl font-bold flex items-center gap-1">
                                <img src="/dirham.svg" alt="AED" className="w-5 h-5" />
                                {stats?.avgOrderValue || '0'}
                            </p>
                            <p className="text-xs mt-1 text-gray-600">Estimated</p>
                        </div>
                    </div>

                    {/* CHARTS ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Orders & GMV */}
                        <div className="bg-white rounded-xl p-5 border shadow-sm">
                            <h3 className="font-semibold mb-3">Orders & GMV Trends</h3>
                            <div className="relative">
                                <svg 
                                    viewBox="0 0 800 280" 
                                    className="w-full h-64"
                                    onMouseMove={(e) => {
                                        const svg = e.currentTarget;
                                        const rect = svg.getBoundingClientRect();
                                        const x = ((e.clientX - rect.left) / rect.width) * 800;
                                        const y = ((e.clientY - rect.top) / rect.height) * 280;
                                        
                                        if (!stats?.ordersAndGMV) return;
                                        
                                        const ordersAndGMV = stats.ordersAndGMV;
                                        const maxValue = Math.max(...ordersAndGMV.map(d => d.estimate));
                                        
                                        // Find closest data point
                                        let closestDist = Infinity;
                                        let closestData: typeof hoveredPoint = null;
                                        
                                        ordersAndGMV.forEach((data, i) => {
                                            const px = 70 + (i * 58);
                                            const py = 220 - ((data.gmv / maxValue) * 180);
                                            const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
                                            
                                            if (dist < 25 && dist < closestDist) {
                                                closestDist = dist;
                                                closestData = {
                                                    x: px,
                                                    y: py,
                                                    value: data.gmv,
                                                    month: data.month,
                                                    type: 'orders'
                                                };
                                            }
                                            
                                            const epy = 220 - ((data.estimate / maxValue) * 180);
                                            const edist = Math.sqrt((x - px) ** 2 + (y - epy) ** 2);
                                            
                                            if (edist < 25 && edist < closestDist) {
                                                closestDist = edist;
                                                closestData = {
                                                    x: px,
                                                    y: epy,
                                                    value: data.estimate,
                                                    month: data.month,
                                                    type: 'estimate'
                                                };
                                            }
                                        });
                                        
                                        setHoveredPoint(closestData);
                                    }}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                >
                                    {/* Grid lines */}
                                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                                        <line
                                            key={i}
                                            x1="60"
                                            y1={40 + i * 30}
                                            x2="780"
                                            y2={40 + i * 30}
                                            stroke="#f3f4f6"
                                            strokeWidth="1"
                                        />
                                    ))}
                                    
                                    {/* Y-axis labels */}
                                    <image x="5" y="17" width="16" height="16" href="/dirham.svg" />
                                    {stats?.ordersAndGMV && (() => {
                                        const maxValue = Math.max(...stats.ordersAndGMV.map(d => d.estimate));
                                        return [6, 5, 4, 3, 2, 1, 0].map((i) => (
                                            <text
                                                key={i}
                                                x="40"
                                                y={45 + (6 - i) * 30}
                                                fontSize="10"
                                                fill="#9ca3af"
                                                textAnchor="end"
                                            >
                                                {((maxValue * i) / 6 / 1000).toFixed(0)}K
                                            </text>
                                        ));
                                    })()}
                                    
                                    {/* Data lines - 12 months */}
                                    {stats?.ordersAndGMV && (() => {
                                        const ordersAndGMV = stats.ordersAndGMV;
                                        const maxValue = Math.max(...ordersAndGMV.map(d => d.estimate));
                                        
                                        const createPoints = (values: number[]) => values.map((val, i) => {
                                            const x = 70 + (i * 58);
                                            const y = 220 - ((val / maxValue) * 180);
                                            return { x, y, val };
                                        });
                                        
                                        const ordersPoints = createPoints(ordersAndGMV.map(d => d.gmv));
                                        const estimatePoints = createPoints(ordersAndGMV.map(d => d.estimate));
                                        
                                        const createSmoothPath = (points: typeof ordersPoints) => {
                                            return points.map((point, i) => {
                                                if (i === 0) return `M ${point.x},${point.y}`;
                                                const prev = points[i - 1];
                                                const cpx1 = prev.x + (point.x - prev.x) / 2;
                                                return `C ${cpx1},${prev.y} ${cpx1},${point.y} ${point.x},${point.y}`;
                                            }).join(' ');
                                        };
                                        
                                        const ordersPath = createSmoothPath(ordersPoints);
                                        const estimatePath = createSmoothPath(estimatePoints);
                                        
                                        // Current month (last month in data)
                                        const currentMonthIndex = ordersAndGMV.length - 1;
                                        const currentPoint = ordersPoints[currentMonthIndex];
                                        
                                        return (
                                            <>
                                                {/* Gradient fills */}
                                                <defs>
                                                    <linearGradient id="ordersGradient" x1="0" x2="0" y1="0" y2="1">
                                                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
                                                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                                                    </linearGradient>
                                                    <linearGradient id="estimateGradient" x1="0" x2="0" y1="0" y2="1">
                                                        <stop offset="0%" stopColor="#86efac" stopOpacity="0.1" />
                                                        <stop offset="100%" stopColor="#86efac" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                
                                                {/* Estimate line (lighter green, background) */}
                                                <path
                                                    d={`${estimatePath} L ${estimatePoints[estimatePoints.length - 1].x},220 L ${estimatePoints[0].x},220 Z`}
                                                    fill="url(#estimateGradient)"
                                                />
                                                <path
                                                    d={estimatePath}
                                                    fill="none"
                                                    stroke="#86efac"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                
                                                {/* Orders line (darker green, foreground) */}
                                                <path
                                                    d={`${ordersPath} L ${ordersPoints[ordersPoints.length - 1].x},220 L ${ordersPoints[0].x},220 Z`}
                                                    fill="url(#ordersGradient)"
                                                />
                                                <path
                                                    d={ordersPath}
                                                    fill="none"
                                                    stroke="#22c55e"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                
                                                {/* X-axis labels */}
                                                {ordersAndGMV.map((data, i) => (
                                                    <text
                                                        key={i}
                                                        x={70 + (i * 58)}
                                                        y="245"
                                                        fontSize="10"
                                                        fill="#9ca3af"
                                                        textAnchor="middle"
                                                    >
                                                        {data.month}
                                                    </text>
                                                ))}
                                                
                                                {/* Highlight current month with vertical line */}
                                                <line
                                                    x1={currentPoint.x}
                                                    y1="40"
                                                    x2={currentPoint.x}
                                                    y2="220"
                                                    stroke="#9ca3af"
                                                    strokeWidth="1"
                                                    strokeDasharray="4 4"
                                                    opacity="0.5"
                                                />
                                                
                                                {/* Current value indicator */}
                                                <circle
                                                    cx={currentPoint.x}
                                                    cy={currentPoint.y}
                                                    r="5"
                                                    fill="#22c55e"
                                                />
                                                <circle
                                                    cx={currentPoint.x}
                                                    cy={currentPoint.y}
                                                    r="3"
                                                    fill="white"
                                                />
                                                
                                                {/* Value label */}
                                                <rect
                                                    x={currentPoint.x + 10}
                                                    y={currentPoint.y - 12}
                                                    width="90"
                                                    height="20"
                                                    rx="3"
                                                    fill="white"
                                                    stroke="#e5e7eb"
                                                />
                                                <image x={currentPoint.x + 13} y={currentPoint.y - 9} width="14" height="14" href="/dirham.svg" />
                                                <text
                                                    x={currentPoint.x + 30}
                                                    y={currentPoint.y + 2}
                                                    fontSize="11"
                                                    fill="#22c55e"
                                                    fontWeight="600"
                                                >
                                                    {(ordersAndGMV[currentMonthIndex].gmv).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </text>
                                                
                                                {/* Hover tooltip */}
                                                {hoveredPoint && (
                                                    <>
                                                        <circle
                                                            cx={hoveredPoint.x}
                                                            cy={hoveredPoint.y}
                                                            r="6"
                                                            fill={hoveredPoint.type === 'orders' ? '#22c55e' : '#86efac'}
                                                            opacity="0.5"
                                                        />
                                                        <circle
                                                            cx={hoveredPoint.x}
                                                            cy={hoveredPoint.y}
                                                            r="4"
                                                            fill={hoveredPoint.type === 'orders' ? '#22c55e' : '#86efac'}
                                                        />
                                                        <rect
                                                            x={hoveredPoint.x - 60}
                                                            y={hoveredPoint.y - 40}
                                                            width="120"
                                                            height="30"
                                                            rx="5"
                                                            fill="rgba(0, 0, 0, 0.8)"
                                                        />
                                                        <text
                                                            x={hoveredPoint.x}
                                                            y={hoveredPoint.y - 28}
                                                            fontSize="10"
                                                            fill="white"
                                                            textAnchor="middle"
                                                            fontWeight="600"
                                                        >
                                                            {hoveredPoint.month} - {hoveredPoint.type === 'orders' ? 'Orders' : 'Estimate'}
                                                        </text>
                                                        <g>
                                                            <image x={hoveredPoint.x - 24} y={hoveredPoint.y - 23} width="14" height="14" href="/dirham.svg" />
                                                            <text
                                                                x={hoveredPoint.x - 6}
                                                                y={hoveredPoint.y - 15}
                                                                fontSize="11"
                                                                fill="white"
                                                                textAnchor="start"
                                                                fontWeight="bold"
                                                            >
                                                                {hoveredPoint.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </text>
                                                        </g>
                                                    </>
                                                )}
                                            </>
                                        );
                                    })()}
                                    
                                    {/* X-axis label */}
                                    <text x="420" y="270" fontSize="11" fill="#9ca3af" textAnchor="middle">Months</text>
                                </svg>
                            </div>
                            
                            {/* Legend */}
                            <div className="flex items-center gap-6 mt-2 justify-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#22c55e] rounded"></div>
                                    <span className="text-sm text-gray-700">Orders</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#86efac] rounded"></div>
                                    <span className="text-sm text-gray-700">Estimate</span>
                                </div>
                            </div>
                        </div>

                        {/* Orders by Cuisine */}
                        <div className="bg-white rounded-xl p-5 border shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900">Orders by Cuisine</h3>
                                <select className="text-sm border border-gray-300 rounded px-3 py-1 text-gray-700">
                                    <option>Monthly</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between gap-8">
                                <div className="relative flex items-center justify-center flex-1">
                                    <svg viewBox="0 0 200 200" className="w-64 h-64">
                                        {stats?.ordersByCuisine && stats.ordersByCuisine.length > 0 && (() => {
                                            const total = stats.ordersByCuisine.reduce((sum, item) => sum + item.orders, 0);
                                            let currentAngle = 0;
                                            
                                            return (
                                                <>
                                                    {stats.ordersByCuisine.map((item, idx) => {
                                                        const percentage = (item.orders / total) * 100;
                                                        const angle = (percentage / 100) * 360;
                                                        const startAngle = currentAngle;
                                                        currentAngle += angle;
                                                        
                                                        // Outer arc coordinates
                                                        const outerRadius = 85;
                                                        const innerRadius = 50;
                                                        
                                                        const startRad = (startAngle - 90) * Math.PI / 180;
                                                        const endRad = (currentAngle - 90) * Math.PI / 180;
                                                        
                                                        const x1 = 100 + outerRadius * Math.cos(startRad);
                                                        const y1 = 100 + outerRadius * Math.sin(startRad);
                                                        const x2 = 100 + outerRadius * Math.cos(endRad);
                                                        const y2 = 100 + outerRadius * Math.sin(endRad);
                                                        
                                                        const x3 = 100 + innerRadius * Math.cos(endRad);
                                                        const y3 = 100 + innerRadius * Math.sin(endRad);
                                                        const x4 = 100 + innerRadius * Math.cos(startRad);
                                                        const y4 = 100 + innerRadius * Math.sin(startRad);
                                                        
                                                        const largeArc = angle > 180 ? 1 : 0;
                                                        
                                                        // Calculate label position (middle of the arc)
                                                        const midAngle = (startAngle + currentAngle) / 2 - 90;
                                                        const midRad = midAngle * Math.PI / 180;
                                                        const labelRadius = (outerRadius + innerRadius) / 2;
                                                        const labelX = 100 + labelRadius * Math.cos(midRad);
                                                        const labelY = 100 + labelRadius * Math.sin(midRad);
                                                        
                                                        return (
                                                            <g key={idx}>
                                                                <path
                                                                    d={`M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`}
                                                                    fill={item.color}
                                                                />
                                                                {percentage > 8 && (
                                                                    <text
                                                                        x={labelX}
                                                                        y={labelY}
                                                                        textAnchor="middle"
                                                                        dominantBaseline="middle"
                                                                        className="text-xs font-semibold fill-white"
                                                                        style={{ fontSize: '10px' }}
                                                                    >
                                                                        {percentage.toFixed(1)}%
                                                                    </text>
                                                                )}
                                                            </g>
                                                        );
                                                    })}
                                                    
                                                    {/* Center text */}
                                                    <text
                                                        x="100"
                                                        y="100"
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        className="text-sm font-medium fill-gray-600"
                                                        style={{ fontSize: '14px' }}
                                                    >
                                                        Cuisine
                                                    </text>
                                                </>
                                            );
                                        })()}
                                        
                                        {/* Show placeholder if no data */}
                                        {(!stats?.ordersByCuisine || stats.ordersByCuisine.length === 0) && (
                                            <>
                                                <circle
                                                    cx="100"
                                                    cy="100"
                                                    r="85"
                                                    fill="#22c55e"
                                                    opacity="0.3"
                                                />
                                                <circle
                                                    cx="100"
                                                    cy="100"
                                                    r="50"
                                                    fill="white"
                                                />
                                                <text
                                                    x="100"
                                                    y="100"
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="text-sm font-medium fill-gray-600"
                                                    style={{ fontSize: '14px' }}
                                                >
                                                    Cuisine
                                                </text>
                                            </>
                                        )}
                                    </svg>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {stats?.ordersByCuisine && stats.ordersByCuisine.length > 0 ? (
                                        stats.ordersByCuisine.map((item, idx) => {
                                            return (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div 
                                                        className="w-4 h-4 rounded-sm flex-shrink-0" 
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="text-sm text-gray-700 whitespace-nowrap">{item.cuisine}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-sm flex-shrink-0 bg-green-500" />
                                            <span className="text-sm text-gray-700 whitespace-nowrap">Standard</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LOWER GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Quality & Risk */}
                        <div className="bg-white rounded-xl p-5 border shadow-sm">
                            <h3 className="font-semibold mb-4">Quality & Risk Indicators</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-gray-500">Avg Rating</p>
                                    <p className={`text-xl font-bold ${
                                        (stats?.avgRating || 0) >= 4.0 ? 'text-green-600' :
                                        (stats?.avgRating || 0) >= 3.0 ? 'text-orange-500' :
                                        'text-red-500'
                                    }`}>
                                        {stats?.avgRating ? stats.avgRating.toFixed(1) : '0.0'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Cancellation</p>
                                    <p className={`text-xl font-bold ${
                                        (stats?.cancellationRate || 0) <= 2.0 ? 'text-green-600' :
                                        (stats?.cancellationRate || 0) <= 5.0 ? 'text-orange-500' :
                                        'text-red-500'
                                    }`}>
                                        {stats?.cancellationRate ? stats.cancellationRate.toFixed(1) : '0.0'}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Refund</p>
                                    <p className={`text-xl font-bold ${
                                        (stats?.refundRate || 0) <= 2.0 ? 'text-green-600' :
                                        (stats?.refundRate || 0) <= 5.0 ? 'text-orange-500' :
                                        'text-red-500'
                                    }`}>
                                        {stats?.refundRate ? stats.refundRate.toFixed(1) : '0.0'}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Platform Statistics */}
                        <div className="bg-white rounded-xl p-5 border shadow-sm">
                            <h3 className="font-semibold mb-4">Platform Overview</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Orders</span>
                                    <span className="font-semibold text-gray-900">{stats?.totalOrders || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Avg Order Value</span>
                                    <span className="font-semibold text-green-600 flex items-center gap-1">
                                        <img src="/dirham.svg" alt="AED" className="w-4 h-4" />
                                        {(stats?.avgOrderValue || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Active Caterers</span>
                                    <span className="font-semibold text-gray-900">{stats?.activeCaterers || 0}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </>
    );
}

