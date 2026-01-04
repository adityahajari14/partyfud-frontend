'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api/user.api';
import { Trash2, Eye, ShoppingBag, Calendar, MapPin, Users, DollarSign } from 'lucide-react';

interface OrderItem {
    id: string;
    package: {
        id: string;
        name: string;
        people_count: number;
        total_price: number;
        currency: string;
        cover_image_url?: string | null;
        package_type: {
            id: string;
            name: string;
        };
        caterer: {
            id: string;
            business_name: string | null;
        };
    };
    package_type: {
        id: string;
        name: string;
    };
    location: string | null;
    guests: number | null;
    date: Date | string | null;
    price_at_time: number;
    created_at: Date | string;
}

interface Order {
    id: string;
    user_id: string;
    total_price: number;
    currency: string;
    status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
    items: OrderItem[];
    created_at: Date | string;
    updated_at: Date | string;
}

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await userApi.getOrders();
            
            if (response.error) {
                setError(response.error);
            } else if (response.data?.data) {
                setOrders(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = async (orderId: string) => {
        try {
            const response = await userApi.getOrderById(orderId);
            
            if (response.error) {
                setMessage({ type: 'error', text: response.error });
            } else if (response.data?.data) {
                setSelectedOrder(response.data.data);
                setShowOrderDetails(true);
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
            setMessage({ type: 'error', text: 'Failed to load order details' });
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            return;
        }

        setDeletingOrderId(orderId);
        setMessage(null);

        try {
            const response = await userApi.deleteOrder(orderId);
            
            if (response.error) {
                setMessage({ type: 'error', text: response.error });
            } else {
                setMessage({ type: 'success', text: 'Order cancelled successfully' });
                // Remove order from list
                setOrders(orders.filter(order => order.id !== orderId));
                // Close details if viewing this order
                if (selectedOrder?.id === orderId) {
                    setShowOrderDetails(false);
                    setSelectedOrder(null);
                }
                // Clear message after 3 seconds
                setTimeout(() => {
                    setMessage(null);
                }, 3000);
            }
        } catch (err) {
            console.error('Error deleting order:', err);
            setMessage({ type: 'error', text: 'Failed to cancel order' });
        } finally {
            setDeletingOrderId(null);
        }
    };

    const formatDate = (date: Date | string | null) => {
        if (!date) return 'Not specified';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'CONFIRMED':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'PAID':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'PREPARING':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'OUT_FOR_DELIVERY':
                return 'bg-indigo-100 text-indigo-800 border-indigo-300';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const canCancelOrder = (status: string) => {
        return status === 'PENDING' || status === 'CANCELLED';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (error && orders.length === 0) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchOrders}
                        className="bg-[#268700] text-white px-6 py-2 rounded-full hover:bg-[#1f6b00] transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-600">
                        {orders.length === 0 
                            ? 'You have no orders yet' 
                            : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} found`}
                    </p>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-sm ${
                        message.type === 'success' 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                        {message.text}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                        <a
                            href="/user/packages"
                            className="inline-block bg-[#268700] text-white px-6 py-3 rounded-full hover:bg-[#1f6b00] transition"
                        >
                            Browse Packages
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Order Header */}
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Order #{order.id.slice(0, 8).toUpperCase()}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Placed on {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Total</p>
                                                <p className="text-xl font-bold text-[#268700]">
                                                    {order.currency} {order.total_price.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.items.slice(0, 2).map((item) => (
                                            <div key={item.id} className="flex gap-4">
                                                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                                                    <Image
                                                        src={item.package.cover_image_url || '/default_dish.jpg'}
                                                        alt={item.package.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 mb-1">
                                                        {item.package.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        {item.package.caterer.business_name || 'Unknown Caterer'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.package_type.name}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-semibold text-gray-900">
                                                        {item.package.currency} {item.price_at_time.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {order.items.length > 2 && (
                                            <p className="text-sm text-gray-600 text-center pt-2">
                                                +{order.items.length - 2} more item{order.items.length - 2 === 1 ? '' : 's'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Order Actions */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleViewOrder(order.id)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition bg-white"
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </button>
                                    {canCancelOrder(order.status) && (
                                        <button
                                            onClick={() => handleDeleteOrder(order.id)}
                                            disabled={deletingOrderId === order.id}
                                            className="flex items-center gap-2 px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {deletingOrderId === order.id ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none backdrop-blur-sm bg-white/10">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Placed on {formatDate(selectedOrder.created_at)}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowOrderDetails(false);
                                    setSelectedOrder(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Order Status */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Order Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                                            {getStatusLabel(selectedOrder.status)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                        <p className="text-2xl font-bold text-[#268700]">
                                            {selectedOrder.currency} {selectedOrder.total_price.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                                <div className="space-y-4">
                                    {selectedOrder.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                                        >
                                            <div className="flex gap-4">
                                                <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                                                    <Image
                                                        src={item.package.cover_image_url || '/default_dish.jpg'}
                                                        alt={item.package.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 mb-1">
                                                        {item.package.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {item.package.caterer.business_name || 'Unknown Caterer'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mb-3">
                                                        {item.package_type.name}
                                                    </p>

                                                    {/* Item Details Grid */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {item.guests && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Users size={16} />
                                                                <span>{item.guests} guests</span>
                                                            </div>
                                                        )}
                                                        {item.location && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <MapPin size={16} />
                                                                <span className="truncate">{item.location}</span>
                                                            </div>
                                                        )}
                                                        {item.date && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Calendar size={16} />
                                                                <span>{formatDate(item.date)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 text-sm font-semibold text-[#268700]">
                                                            <DollarSign size={16} />
                                                            <span>{item.package.currency} {item.price_at_time.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setShowOrderDetails(false);
                                        setSelectedOrder(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Close
                                </button>
                                {canCancelOrder(selectedOrder.status) && (
                                    <button
                                        onClick={() => {
                                            handleDeleteOrder(selectedOrder.id);
                                            setShowOrderDetails(false);
                                            setSelectedOrder(null);
                                        }}
                                        disabled={deletingOrderId === selectedOrder.id}
                                        className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {deletingOrderId === selectedOrder.id ? 'Cancelling...' : 'Cancel Order'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

