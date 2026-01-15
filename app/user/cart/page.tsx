'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api/user.api';
import { Trash2, ShoppingBag, Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { Toast, useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/constants';

interface CartItem {
  id: string;
  package: {
    id: string;
    name: string;
    people_count: number;
    total_price: number;
    price_per_person: number;
    currency: string;
    cover_image_url?: string | null;
    package_type: {
      id: string;
      name: string;
    };
    caterer: {
      id: string;
      business_name: string | null;
      name?: string;
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
  const { toast, showToast, hideToast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await userApi.getCartItems();
      if (res.data?.data) {
        setCartItems(res.data.data);
      }
    } catch (err) {
      showToast('error', 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    setDeletingId(itemId);
    try {
      const res = await userApi.deleteCartItem(itemId);
      if (res.error) {
        showToast('error', res.error);
        return;
      }
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      showToast('success', 'Item removed from cart');
    } catch (err) {
      showToast('error', 'Failed to remove item');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      showToast('error', 'Your cart is empty');
      return;
    }

    setCheckingOut(true);
    try {
      const res = await userApi.createOrder({
        cart_item_ids: cartItems.map((item) => item.id),
        items: [],
      });

      if (res.error) {
        showToast('error', res.error);
        return;
      }

      if (res.data?.success) {
        showToast('success', 'Order placed successfully!');
        setCartItems([]);
        setTimeout(() => {
          router.push('/user/orders');
        }, 1500);
      }
    } catch (err) {
      showToast('error', 'Failed to place order');
    } finally {
      setCheckingOut(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price_at_time || item.package.total_price || 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-500 text-sm mt-1">
            {cartItems.length === 0
              ? 'Your cart is empty'
              : `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'} in your cart`}
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Browse our caterers and packages to get started
            </p>
            <Link
              href="/user/caterers"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
            >
              Browse Caterers
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="relative w-full sm:w-40 h-40 sm:h-auto shrink-0 bg-gray-100">
                      <Image
                        src={item.package.cover_image_url || '/logo_partyfud.svg'}
                        alt={item.package.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 sm:p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {item.package.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.package.caterer?.business_name || item.package.caterer?.name || 'Caterer'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Remove"
                        >
                          {deletingId === item.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {item.guests || item.package.people_count} guests
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 truncate">
                            {item.location || 'Not set'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {item.date
                              ? formatDate(item.date, false)
                              : 'Not set'}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">
                          {item.package.currency} {item.package.price_per_person?.toLocaleString()}/person
                        </span>
                        <span className="font-bold text-green-600">
                          {item.package.currency} {(item.price_at_time || item.package.total_price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
                <h2 className="font-semibold text-lg text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                    </span>
                    <span className="font-medium">AED {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-gray-500">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-green-600">
                      AED {subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut || cartItems.length === 0}
                  className={`w-full py-3 rounded-lg font-medium transition mb-3 ${
                    checkingOut || cartItems.length === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
                </button>

                <Link
                  href="/user/caterers"
                  className="block w-full text-center py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={hideToast} />
      )}
    </section>
  );
}
