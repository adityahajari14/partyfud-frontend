'use client';

import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { userApi, type Package } from '@/lib/api/user.api';
import { Check, ChevronLeft, Users, Calendar, MapPin, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Toast, useToast } from '@/components/ui/Toast';
import { formatDate, DUBAI_LOCATIONS } from '@/lib/constants';

interface GroupedItems {
  [category: string]: Array<{
    id: string;
    dish: {
      id: string;
      name: string;
      category?: { name: string };
    };
    quantity: number;
    is_optional: boolean;
  }>;
}

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  const packageId = params.packageId as string;
  const catererId = params.catererId as string;

  // Data states
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states from query params
  const [guestCount, setGuestCount] = useState(50);
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');

  // Cart states
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  // For customizable packages
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set());

  // Initialize form from query params
  useEffect(() => {
    const guests = searchParams.get('guests');
    const type = searchParams.get('eventType');
    const loc = searchParams.get('location');
    const date = searchParams.get('date');

    if (guests) setGuestCount(parseInt(guests, 10));
    if (type) setEventType(type);
    if (loc) setLocation(loc);
    if (date) setEventDate(date);
  }, [searchParams]);

  // Fetch package data
  useEffect(() => {
    if (!packageId) return;

    const fetchPackage = async () => {
      setLoading(true);
      try {
        const res = await userApi.getPackageById(packageId);

        if (res.error) {
          setError(res.error);
          return;
        }

        if (res.data?.data) {
          const packageData = res.data.data;

          // Redirect user-created packages
          if (packageData.created_by === 'USER') {
            router.replace(`/user/mypackages/${packageId}`);
            return;
          }

          setPkg(packageData);

          // Set default guest count if not from params
          if (!searchParams.get('guests') && packageData.people_count) {
            setGuestCount(packageData.people_count);
          }
        }
      } catch (err) {
        setError('Failed to load package');
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId, router, searchParams]);

  // Check if package is in cart
  useEffect(() => {
    if (!packageId || !user) return;

    const checkCart = async () => {
      try {
        const res = await userApi.getCartItems();
        if (res.data?.data) {
          const item = res.data.data.find((i: any) => i.package?.id === packageId);
          if (item) {
            setIsInCart(true);
            setCartItemId(item.id);
          }
        }
      } catch (err) {
        console.error('Error checking cart:', err);
      }
    };

    checkCart();
  }, [packageId, user]);

  // Group items by category
  const groupedItems = useMemo<GroupedItems>(() => {
    if (!pkg?.items) return {};

    return pkg.items.reduce((acc: GroupedItems, item: any) => {
      const category = item.dish?.category?.name || item.dish?.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  }, [pkg]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!pkg) return 0;
    const multiplier = guestCount / pkg.people_count;
    return Math.round(pkg.total_price * multiplier);
  }, [pkg, guestCount]);

  // Check if package is customizable
  const isCustomizable = pkg?.customisation_type === 'CUSTOMISABLE' || pkg?.customisation_type === 'CUSTOMIZABLE';

  // Toggle dish selection for customizable packages
  const toggleDish = (dishId: string) => {
    if (!isCustomizable) return;
    const newSelected = new Set(selectedDishes);
    if (newSelected.has(dishId)) {
      newSelected.delete(dishId);
    } else {
      newSelected.add(dishId);
    }
    setSelectedDishes(newSelected);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!pkg) return;

    // Check authentication
    if (!user) {
      showToast('error', 'Please log in to add items to cart');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    // Validate form
    if (!eventType) {
      showToast('error', 'Please select an event type');
      return;
    }
    if (!location) {
      showToast('error', 'Please select a location');
      return;
    }
    if (!eventDate) {
      showToast('error', 'Please select an event date');
      return;
    }
    if (!guestCount || guestCount <= 0) {
      showToast('error', 'Please enter number of guests');
      return;
    }

    setAddingToCart(true);
    try {
      // Format date
      const dateObj = new Date(eventDate);
      dateObj.setHours(18, 0, 0, 0);

      const res = await userApi.createCartItem({
        package_id: pkg.id,
        package_type_id: pkg.package_type?.id,
        location,
        guests: guestCount,
        date: dateObj.toISOString(),
        price_at_time: totalPrice,
      });

      if (res.error) {
        showToast('error', res.error);
        return;
      }

      if (res.data?.success) {
        showToast('success', 'Added to cart successfully!');
        setIsInCart(true);
        if (res.data?.data?.id) {
          setCartItemId(res.data.data.id);
        }
      }
    } catch (err) {
      showToast('error', 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle remove from cart
  const handleRemoveFromCart = async () => {
    if (!cartItemId) return;

    setAddingToCart(true);
    try {
      const res = await userApi.deleteCartItem(cartItemId);
      if (res.error) {
        showToast('error', res.error);
        return;
      }
      showToast('success', 'Removed from cart');
      setIsInCart(false);
      setCartItemId(null);
    } catch (err) {
      showToast('error', 'Failed to remove from cart');
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle proceed to cart
  const handleProceedToCart = () => {
    router.push('/user/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading package...</p>
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || 'Package not found'}</p>
          <Link
            href={`/user/caterers/${catererId}`}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Caterer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 min-h-screen pb-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/user/caterers/${catererId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Caterer</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-block text-xs px-2 py-1 rounded-full mb-2 ${
                    isCustomizable
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isCustomizable ? 'Customizable' : 'Fixed Menu'}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">{pkg.name}</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {pkg.package_type?.name || 'Package'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    AED {pkg.price_per_person.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">per person</p>
                </div>
              </div>

              {/* Package Image */}
              {pkg.cover_image_url && (
                <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={pkg.cover_image_url}
                    alt={pkg.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Caterer Info */}
              {pkg.caterer && (
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-700">
                      {pkg.caterer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{pkg.caterer.name}</p>
                    {pkg.caterer.location && (
                      <p className="text-xs text-gray-500">{pkg.caterer.location}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Menu Items
                  {isCustomizable && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Select items to customize)
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500">
                  {pkg.items.length} items included for {pkg.people_count} people
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category}>
                    <div className="bg-gray-50 px-4 py-2 font-medium text-sm text-gray-700">
                      {category}
                      {isCustomizable && (
                        <span className="text-gray-400 ml-2">
                          ({items.filter((i) => selectedDishes.has(i.dish?.id)).length}/{items.length})
                        </span>
                      )}
                    </div>
                    {items.map((item) => {
                      const dishId = item.dish?.id;
                      const isSelected = selectedDishes.has(dishId);

                      return (
                        <div
                          key={item.id}
                          onClick={() => dishId && toggleDish(dishId)}
                          className={`px-4 py-3 flex items-center justify-between ${
                            isCustomizable ? 'cursor-pointer hover:bg-gray-50' : ''
                          } ${isSelected ? 'bg-green-50' : ''}`}
                        >
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{item.dish?.name || 'Unknown'}</p>
                            {item.quantity > 1 && (
                              <span className="text-xs text-gray-500">x{item.quantity}</span>
                            )}
                          </div>
                          {isCustomizable && (
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? 'bg-green-600 border-green-600'
                                : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Event Details & Booking */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              <h3 className="font-semibold text-lg mb-4 text-gray-900">
                Your Event Details
              </h3>

              {/* Event Type Display */}
              {eventType && (
                <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Event Type</p>
                    <p className="text-sm font-medium text-gray-900">Selected</p>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Location</option>
                  {DUBAI_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guest Count */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guests <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setGuestCount(Math.max(1, guestCount - 10))}
                    className="px-3 py-2.5 text-gray-600 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value)))}
                    className="flex-1 text-center py-2.5 text-sm focus:outline-none"
                  />
                  <button
                    onClick={() => setGuestCount(guestCount + 10)}
                    className="px-3 py-2.5 text-gray-600 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Event Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Price Summary */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Price per person</span>
                  <span>AED {pkg.price_per_person.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Number of guests</span>
                  <span>{guestCount}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-green-600">AED {totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total for {guestCount} guests</p>
              <p className="text-2xl font-bold text-gray-900">
                AED {totalPrice.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3">
              {isInCart ? (
                <>
                  <button
                    onClick={handleRemoveFromCart}
                    disabled={addingToCart}
                    className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Remove
                  </button>
                  <button
                    onClick={handleProceedToCart}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Go to Cart
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !eventType || !location || !eventDate}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                    addingToCart || !eventType || !location || !eventDate
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {addingToCart ? (
                    'Adding...'
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={hideToast} />
      )}
    </section>
  );
}
