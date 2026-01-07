'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api/user.api';
import { Trash2, Edit, ShoppingBag } from 'lucide-react';

interface CartItem {
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
    price_at_time: number | null;
    created_at: Date | string;
    updated_at: Date | string;
}

export default function CartPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
    const [checkingOut, setCheckingOut] = useState(false);
    const [checkoutMessage, setCheckoutMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await userApi.getCartItems();
            
            if (response.error) {
                setError(response.error);
            } else if (response.data?.data) {
                setCartItems(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching cart items:', err);
            setError('Failed to load cart items');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Are you sure you want to remove this item from your cart?')) {
            return;
        }

        setDeletingItemId(itemId);
        try {
            const response = await userApi.deleteCartItem(itemId);
            
            if (response.error) {
                alert(response.error);
            } else {
                // Remove item from local state
                setCartItems(cartItems.filter(item => item.id !== itemId));
            }
        } catch (err) {
            console.error('Error deleting cart item:', err);
            alert('Failed to remove item from cart');
        } finally {
            setDeletingItemId(null);
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

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => {
            return sum + (item.price_at_time || item.package.total_price || 0);
        }, 0);
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            setCheckoutMessage({ type: 'error', text: 'Your cart is empty' });
            return;
        }

        setCheckingOut(true);
        setCheckoutMessage(null);

        try {
            // Get all cart item IDs
            const cartItemIds = cartItems.map(item => item.id);

            const response = await userApi.createOrder({
                cart_item_ids: cartItemIds,
                items: [], // Empty since we're using cart_item_ids
            });

            if (response.error) {
                setCheckoutMessage({ type: 'error', text: response.error });
            } else if (response.data?.success) {
                setCheckoutMessage({ type: 'success', text: 'Order created successfully! Redirecting...' });
                
                // Clear cart items from state
                setCartItems([]);
                
                // Redirect to orders page after 2 seconds
                setTimeout(() => {
                    router.push('/user/orders');
                }, 2000);
            } else {
                setCheckoutMessage({ type: 'error', text: 'Failed to create order' });
            }
        } catch (err) {
            console.error('Error creating order:', err);
            setCheckoutMessage({ type: 'error', text: 'An error occurred while creating order' });
        } finally {
            setCheckingOut(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading cart...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchCartItems}
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
                    <p className="text-gray-600">
                        {cartItems.length === 0 
                            ? 'Your cart is empty' 
                            : `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'} in your cart`}
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-600 mb-6">Start adding items to your cart to continue shopping</p>
                        <a
                            href="/user/packages"
                            className="inline-block bg-[#268700] text-white px-6 py-3 rounded-full hover:bg-[#1f6b00] transition"
                        >
                            Browse Packages
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        {/* Image */}
                                        <div className="relative w-full md:w-48 h-48 md:h-auto shrink-0">
                                            <Image
                                                src={item.package.cover_image_url || '/default_dish.jpg'}
                                                alt={item.package.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-6">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                        {item.package.name}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        {item.package.caterer.business_name || 'Unknown Caterer'}
                                                    </p>
                                                    <p className="text-gray-500 text-xs mb-1">
                                                        {item.package_type.name}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    disabled={deletingItemId === item.id}
                                                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                    title="Remove from cart"
                                                >
                                                    {deletingItemId === item.id ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                                                    ) : (
                                                        <Trash2 size={20} />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">People</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {item.guests || item.package.people_count}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Location</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {item.location || 'Not specified'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Date</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {formatDate(item.date)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Price</p>
                                                    <p className="text-sm font-semibold text-[#268700]">
                                                        {item.package.currency} {item.price_at_time?.toLocaleString() || item.package.total_price.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                                >
                                                    <Edit size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-4">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                                        <span className="font-medium text-gray-900 flex items-center gap-1">
                                            <img src="/dirham.svg" alt="AED" className="w-4 h-4" />
                                            {calculateTotal().toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery Fee</span>
                                        <span className="font-medium text-gray-900">TBD</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4 flex justify-between">
                                        <span className="text-lg font-semibold text-gray-900">Total</span>
                                        <span className="text-lg font-bold text-[#268700] flex items-center gap-1">
                                            <img src="/dirham.svg" alt="AED" className="w-5 h-5" />
                                            {calculateTotal().toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Checkout Message */}
                                {checkoutMessage && (
                                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                                        checkoutMessage.type === 'success' 
                                            ? 'bg-green-100 text-green-800 border border-green-300' 
                                            : 'bg-red-100 text-red-800 border border-red-300'
                                    }`}>
                                        {checkoutMessage.text}
                                    </div>
                                )}

                                <button
                                    onClick={handleCheckout}
                                    disabled={checkingOut || cartItems.length === 0}
                                    className={`w-full py-3 rounded-full font-semibold transition mb-4 ${
                                        checkingOut || cartItems.length === 0
                                            ? 'bg-gray-400 cursor-not-allowed text-white'
                                            : 'bg-[#268700] text-white hover:bg-[#1f6b00]'
                                    }`}
                                >
                                    {checkingOut ? 'Processing Order...' : 'Proceed to Checkout'}
                                </button>

                                <button
                                    onClick={() => window.location.href = '/user/packages'}
                                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-50 transition"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

