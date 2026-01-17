'use client';

import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { userApi, type Package } from '@/lib/api/user.api';
import { Check, ChevronLeft, Users, Calendar, MapPin, ShoppingCart, Minus, Plus, X, Eye } from 'lucide-react';
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
      price?: number;
    };
    quantity: number;
    is_optional: boolean;
    price_at_time?: number | null;
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
  const [occasions, setOccasions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states from query params
  const [guestCount, setGuestCount] = useState(50);
  const [eventType, setEventType] = useState('');
  const [eventTypeName, setEventTypeName] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');

  // Cart states
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  // For customizable packages
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set());
  
  // Modal state for viewing all dishes
  const [showAllDishesModal, setShowAllDishesModal] = useState(false);

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
        const [packageRes, occasionsRes] = await Promise.all([
          userApi.getPackageById(packageId),
          userApi.getOccasions(),
        ]);

        if (packageRes.error) {
          setError(packageRes.error);
          return;
        }

        if (packageRes.data?.data) {
          const packageData = packageRes.data.data;

          // Redirect user-created packages
          if (packageData.created_by === 'USER') {
            router.replace(`/mypackages/${packageId}`);
            return;
          }

          setPkg(packageData);

          // Set default guest count if not from params
          if (!searchParams.get('guests') && packageData.people_count) {
            setGuestCount(packageData.people_count);
          }
        }

        // Store occasions for lookup
        if (occasionsRes.data?.data) {
          setOccasions(occasionsRes.data.data);
        }
      } catch (err) {
        setError('Failed to load package');
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId, router, searchParams]);

  // Set event type name from ID
  useEffect(() => {
    const typeParam = searchParams.get('eventType');
    if (typeParam && occasions.length > 0) {
      const matchingOccasion = occasions.find((occ: any) => occ.id === typeParam);
      if (matchingOccasion?.name) {
        setEventTypeName(matchingOccasion.name);
      } else {
        // If no match and it's not a UUID, use as-is (might be a name)
        setEventTypeName(typeParam.includes('-') ? '' : typeParam);
      }
    } else if (typeParam && !typeParam.includes('-')) {
      // Not a UUID, use as-is
      setEventTypeName(typeParam);
    }
  }, [searchParams, occasions]);

  // Check if package is in cart
  useEffect(() => {
    if (!packageId) return;

    const checkCart = async () => {
      try {
        if (user) {
          // Check server cart for authenticated users
          const res = await userApi.getCartItems();
          if (res.data?.data) {
            const item = res.data.data.find((i: any) => i.package?.id === packageId);
            if (item) {
              setIsInCart(true);
              setCartItemId(item.id);
            }
          }
        } else {
          // Check localStorage for non-authenticated users
          const { cartStorage } = await import('@/lib/utils/cartStorage');
          const localItems = cartStorage.getItems();
          const item = localItems.find((i) => i.package_id === packageId);
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

  // Check if package is customizable
  const isCustomizable = pkg?.customisation_type === 'CUSTOMISABLE' || pkg?.customisation_type === 'CUSTOMIZABLE';

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

  // Get category selection limits for CUSTOMISABLE packages
  const categoryLimits = useMemo(() => {
    if (!pkg?.category_selections || !isCustomizable) return {};
    
    const limits: Record<string, number | null> = {};
    pkg.category_selections.forEach((selection: any) => {
      const categoryName = selection.category?.name || '';
      limits[categoryName] = selection.num_dishes_to_select;
    });
    return limits;
  }, [pkg, isCustomizable]);

  // Get selected count per category for CUSTOMISABLE packages
  const getSelectedCountForCategory = (categoryName: string): number => {
    if (!isCustomizable) return 0;
    const items = groupedItems[categoryName] || [];
    return items.filter((item) => selectedDishes.has(item.dish?.id)).length;
  };

  // Check if user can select more dishes in a category
  const canSelectMoreInCategory = (categoryName: string): boolean => {
    if (!isCustomizable) return false;
    
    // If no category selections are defined, allow unlimited selection
    // This happens when caterer creates a customizable package without specifying limits
    if (!pkg?.category_selections || pkg.category_selections.length === 0) {
      return true; // No limits - user can select any number of dishes
    }
    
    const limit = categoryLimits[categoryName];
    if (limit === undefined) return true; // Category not in selections - allow unlimited
    if (limit === null) return true; // No limit (select all)
    const selected = getSelectedCountForCategory(categoryName);
    return selected < limit;
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!pkg) return 0;
    
    // For customizable packages without category limits, calculate price from selected dishes
    if (isCustomizable && (!pkg.category_selections || pkg.category_selections.length === 0)) {
      let selectedTotal = 0;
      for (const [, items] of Object.entries(groupedItems)) {
        for (const item of items) {
          if (selectedDishes.has(item.dish?.id)) {
            // Use price_at_time from item if available, otherwise use dish price, fallback to 0
            const dishPrice = Number(item.price_at_time || item.dish?.price || 0);
            const quantity = item.quantity || 1;
            selectedTotal += dishPrice * quantity * guestCount;
          }
        }
      }
      return Math.round(selectedTotal);
    }
    
    // For fixed packages or customizable with limits, use the package total price
    const peopleCount = pkg.people_count || pkg.minimum_people || 1;
    const multiplier = guestCount / peopleCount;
    return Math.round(pkg.total_price * multiplier);
  }, [pkg, guestCount, isCustomizable, groupedItems, selectedDishes]);

  // Toggle dish selection for customizable packages
  const toggleDish = (dishId: string, categoryName: string) => {
    if (!isCustomizable) return;
    
    const newSelected = new Set(selectedDishes);
    const isCurrentlySelected = newSelected.has(dishId);
    
    if (isCurrentlySelected) {
      // Remove dish
      newSelected.delete(dishId);
    } else {
      // Check if we can add more dishes in this category
      if (!canSelectMoreInCategory(categoryName)) {
        showToast('error', `You can only select ${categoryLimits[categoryName] === null ? 'all' : categoryLimits[categoryName]} dish(es) from ${categoryName}`);
        return;
      }
      newSelected.add(dishId);
    }
    setSelectedDishes(newSelected);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!pkg) return;

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

    // Validate CUSTOMISABLE package selections
    if (isCustomizable) {
      if (pkg.category_selections && pkg.category_selections.length > 0) {
        // Package has category limits - validate against them
        for (const selection of pkg.category_selections) {
          const categoryName = selection.category?.name || '';
          const limit = selection.num_dishes_to_select;
          const selectedCount = getSelectedCountForCategory(categoryName);
          const availableCount = groupedItems[categoryName]?.length || 0;
          
          // Require at least one dish to be selected from each category
          if (selectedCount === 0 && availableCount > 0) {
            showToast('error', `Please select at least one dish from ${categoryName} category`);
            return;
          }
          
          // Check if limit is exceeded
          if (limit !== null && selectedCount > limit) {
            showToast('error', `You can only select up to ${limit} dish${limit === 1 ? '' : 'es'} from ${categoryName} category`);
            return;
          }
        }
      } else {
        // Package has no category limits - just require at least one dish selected
        if (selectedDishes.size === 0) {
          showToast('error', 'Please select at least one dish');
          return;
        }
      }
    }

    setAddingToCart(true);
    try {
      // Format date
      const dateObj = new Date(eventDate);
      dateObj.setHours(18, 0, 0, 0);

      if (!user) {
        // Store in localStorage for non-authenticated users
        const { cartStorage } = await import('@/lib/utils/cartStorage');
        const localItem = cartStorage.addItem({
          package_id: pkg.id,
          package: {
            id: pkg.id,
            name: pkg.name,
            people_count: pkg.people_count || pkg.minimum_people || 1,
            total_price: pkg.total_price,
            price_per_person: pkg.price_per_person || pkg.total_price / (pkg.people_count || pkg.minimum_people || 1),
            currency: pkg.currency,
            cover_image_url: pkg.cover_image_url,
            caterer: {
              id: pkg.caterer?.id || '',
              business_name: (pkg.caterer as any)?.business_name || null,
              name: (pkg.caterer as any)?.name,
            },
          },
          location,
          guests: guestCount,
          date: dateObj.toISOString(),
          price_at_time: totalPrice,
        });
        
        showToast('success', 'Added to cart');
        setIsInCart(true);
        setCartItemId(localItem.id);
      } else {
        // Add to server cart for authenticated users
        const res = await userApi.createCartItem({
          package_id: pkg.id,
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
      if (user) {
        // Remove from server for authenticated users
        const res = await userApi.deleteCartItem(cartItemId);
        if (res.error) {
          showToast('error', res.error);
          return;
        }
      } else {
        // Remove from localStorage for non-authenticated users
        const { cartStorage } = await import('@/lib/utils/cartStorage');
        cartStorage.removeItem(cartItemId);
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
    router.push('/cart');
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
            href={`/caterers/${catererId}`}
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
          onClick={() => router.push(`/caterers/${catererId}`)}
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
                  <span className={`inline-block text-xs px-2 py-1 rounded-full mb-2 ${isCustomizable
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                    {isCustomizable ? 'Customizable Package' : 'Fixed Package'}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">{pkg.name}</h1>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    AED {(() => {
                      // For customizable packages without limits, show price based on selection
                      if (isCustomizable && (!pkg.category_selections || pkg.category_selections.length === 0)) {
                        if (selectedDishes.size === 0) return '0';
                        return (totalPrice / guestCount).toLocaleString();
                      }
                      const peopleCount = pkg.people_count || pkg.minimum_people || 1;
                      const pricePerPerson = pkg.price_per_person ?? (pkg.total_price / peopleCount);
                      return pricePerPerson.toLocaleString();
                    })()}
                  </p>
                  <p className="text-sm text-gray-500">per person</p>
                </div>
              </div>

              {/* Package Image */}
              {pkg.cover_image_url && (
                <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-gray-50">
                  <Image
                    src={pkg.cover_image_url}
                    alt={pkg.name}
                    fill
                    className="object-contain p-4"
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
                  {isCustomizable ? 'Select Your Dishes' : 'Menu Items'}
                  {isCustomizable && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Customize your package)
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isCustomizable 
                    ? (pkg.category_selections && pkg.category_selections.length > 0
                        ? `Choose dishes from each category according to the limits set by the caterer`
                        : `Select any dishes you want from the menu below`)
                    : `${pkg.items.length} items included for ${pkg.people_count} people`}
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {Object.entries(groupedItems).map(([category, items]) => {
                  const selectedCount = getSelectedCountForCategory(category);
                  const limit = categoryLimits[category];
                  const hasLimits = pkg.category_selections && pkg.category_selections.length > 0;
                  const canSelectMore = canSelectMoreInCategory(category);
                  
                  return (
                    <div key={category}>
                      <div className="bg-gray-50 px-4 py-2 font-medium text-sm text-gray-700">
                        <div className="flex items-center justify-between">
                          <span>{category}</span>
                          {isCustomizable && (
                            <span className={`text-xs font-normal ${selectedCount > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {hasLimits && limit !== undefined
                                ? `${selectedCount} / ${limit === null ? items.length : limit} selected`
                                : `${selectedCount} selected`}
                            </span>
                          )}
                        </div>
                        {isCustomizable && hasLimits && limit !== undefined && (
                          <p className="text-xs text-gray-500 mt-1">
                            Select {limit === null ? 'any dishes' : `up to ${limit} dish${limit === 1 ? '' : 'es'}`} from this category
                          </p>
                        )}
                      </div>
                      {items.map((item) => {
                        const dishId = item.dish?.id;
                        const isSelected = selectedDishes.has(dishId);
                        const isDisabled = isCustomizable && !isSelected && !canSelectMore;

                        return (
                          <div
                            key={item.id}
                            onClick={() => dishId && !isDisabled && toggleDish(dishId, category)}
                            className={`px-4 py-3 flex items-center justify-between ${
                              isCustomizable && !isDisabled ? 'cursor-pointer hover:bg-gray-50' : ''
                            } ${isSelected ? 'bg-green-50' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                  : isDisabled
                                  ? 'border-gray-200 bg-gray-100'
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
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
              {eventTypeName && (
                <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Event Type</p>
                    <p className="text-sm font-medium text-gray-900">{eventTypeName}</p>
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
                  <span>AED {(() => {
                    // For customizable packages without limits, show price based on selection
                    if (isCustomizable && (!pkg.category_selections || pkg.category_selections.length === 0)) {
                      if (selectedDishes.size === 0) return '0';
                      return (totalPrice / guestCount).toLocaleString();
                    }
                    const peopleCount = pkg.people_count || pkg.minimum_people || 1;
                    const pricePerPerson = pkg.price_per_person ?? (pkg.total_price / peopleCount);
                    return pricePerPerson.toLocaleString();
                  })()}</span>
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
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${addingToCart || !eventType || !location || !eventDate
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

      {/* View All Dishes Modal */}
      {showAllDishesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Dishes in {pkg.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {pkg.items.length} dishes across {Object.keys(groupedItems).length} categories
                </p>
              </div>
              <button
                onClick={() => setShowAllDishesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">{category}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {items.length} dish{items.length !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {item.dish?.name || 'Unknown'}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Quantity: {item.quantity}
                                </p>
                              )}
                              {(item.dish as any)?.price && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  AED {Number((item.dish as any).price).toLocaleString()}
                                </p>
                              )}
                            </div>
                            {isCustomizable && (
                              <div className="ml-4">
                                {selectedDishes.has(item.dish?.id) ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                                    <Check className="w-3 h-3" />
                                    Selected
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50 rounded-full">
                                    Not Selected
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAllDishesModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
