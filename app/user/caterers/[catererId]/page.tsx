'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Users,
  Truck,
  Clock,
  Check,
  ChevronRight,
  MapPin,
  Calendar,
  X,
  Info
} from 'lucide-react';
import { userApi, type Package, type Occasion } from '@/lib/api/user.api';
import { useAuth } from '@/contexts/AuthContext';

function CatererMenuContent() {
  const [activeTab, setActiveTab] = useState('setMenusFixed');
  const [caterer, setCaterer] = useState<any>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [occasions, setOccasions] = useState<Occasion[]>([]);

  // Event Details State
  const [selectedEventType, setSelectedEventType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [guestCount, setGuestCount] = useState<number>(20);
  const [eventDate, setEventDate] = useState('');

  // Menu Selection State
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedDishIds, setSelectedDishIds] = useState<Set<string>>(new Set());
  const [loadingItems, setLoadingItems] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const catererId = params.catererId as string;

  // Initial Data Fetch
  useEffect(() => {
    const fetchCatererData = async () => {
      try {
        setLoading(true);
        const [catererRes, occasionsRes] = await Promise.all([
          userApi.getCatererById(catererId),
          userApi.getOccasions()
        ]);

        if (catererRes.data?.data) {
          setCaterer(catererRes.data.data);
          setPackages(catererRes.data.data.packages || []);
        }
        if (occasionsRes.data?.data) {
          setOccasions(occasionsRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch caterer details');
      } finally {
        setLoading(false);
      }
    };

    fetchCatererData();
  }, [catererId]);

  // Read query params
  useEffect(() => {
    const guests = searchParams.get('guests');
    const eventType = searchParams.get('eventType');
    const location = searchParams.get('location');
    const date = searchParams.get('date');

    if (guests) setGuestCount(parseInt(guests));
    if (eventType) setSelectedEventType(eventType);
    if (location) setSelectedLocation(location);
    if (date) setEventDate(date);
  }, [searchParams]);

  const computeInitialSelection = (pkg: Package) => {
    const dishIds = new Set<string>();
    const categoryCounts: { [key: string]: number } = {};
    const items = pkg.items || [];
    const isCustomisable = pkg.customisation_type === 'FIXED'; // Underlying FIXED is labeled Customisable in Dashboard

    items.forEach(item => {
      const dishId = item.dish?.id;
      if (!dishId) return;

      if (isCustomisable) {
        const categoryName = (item.dish?.category?.name || item.dish?.category || 'Uncategorized').toLowerCase();
        const selection = pkg.category_selections?.find(
          s => (s.category?.name || s.category).toLowerCase() === categoryName
        );
        const limit = selection?.num_dishes_to_select;

        if (limit !== null && limit !== undefined) {
          const currentCount = categoryCounts[categoryName] || 0;
          if (currentCount < limit) {
            dishIds.add(dishId);
            categoryCounts[categoryName] = currentCount + 1;
          }
        } else {
          // If no limit specified for a category in a customisable package, 
          // we might want to select all or none. Let's select all by default.
          dishIds.add(dishId);
        }
      } else {
        // FIXED packages have all items included by default
        dishIds.add(dishId);
      }
    });

    return dishIds;
  };

  const handlePackageSelect = async (pkg: Package) => {
    setSelectedPackage(pkg);
    setSelectedDishIds(computeInitialSelection(pkg));
    setLoadingItems(true);

    try {
      const response = await userApi.getPackageById(pkg.id);
      if (response.data?.data) {
        const fullPkg = response.data.data;
        setSelectedPackage(fullPkg);
        setSelectedDishIds(computeInitialSelection(fullPkg));
      }
    } catch (err) {
      console.error('Error fetching full package details:', err);
    } finally {
      setLoadingItems(false);
    }

    setTimeout(() => {
      const el = document.getElementById('menu-items-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const toggleDishSelection = (dishId: string, categoryName: string) => {
    if (!selectedPackage) return;

    const isCustomisable = selectedPackage.customisation_type === 'FIXED';
    if (!isCustomisable) return;

    const newSelected = new Set(selectedDishIds);
    if (newSelected.has(dishId)) {
      newSelected.delete(dishId);
    } else {
      const selection = selectedPackage.category_selections?.find(
        cs => (cs.category?.name || cs.category).toLowerCase() === categoryName.toLowerCase()
      );
      const limit = selection?.num_dishes_to_select;

      if (limit !== null && limit !== undefined) {
        const currentCount = Array.from(newSelected).filter(id => {
          const item = (selectedPackage.items || []).find(i => i.dish?.id === id);
          return (item?.dish?.category?.name || item?.dish?.category)?.toLowerCase() === categoryName.toLowerCase();
        }).length;

        if (currentCount >= limit) {
          setCartMessage({ type: 'error', text: `You can only select ${limit} ${limit === 1 ? 'item' : 'items'} from ${categoryName}` });
          setTimeout(() => setCartMessage(null), 3000);
          return;
        }
      }
      newSelected.add(dishId);
    }
    setSelectedDishIds(newSelected);
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push(`/login?redirect=/user/caterers/${catererId}`);
      return;
    }

    if (!selectedPackage || !selectedLocation || !eventDate || !guestCount) {
      setCartMessage({ type: 'error', text: 'Please complete event details and select a package' });
      return;
    }

    // Validate category selections for CUSTOMISABLE packages
    const isCustomisable = selectedPackage.customisation_type === 'FIXED';
    if (isCustomisable) {
      for (const selection of (selectedPackage.category_selections || [])) {
        const categoryName = selection.category?.name || selection.category;
        const limit = selection.num_dishes_to_select;
        if (limit !== null && limit !== undefined) {
          const selectedInCategory = Array.from(selectedDishIds).filter(id => {
            const item = (selectedPackage.items || []).find(i => i.dish?.id === id);
            return (item?.dish?.category?.name || item?.dish?.category)?.toLowerCase() === categoryName.toLowerCase();
          }).length;

          if (selectedInCategory < limit) {
            setCartMessage({ type: 'error', text: `Please select exactly ${limit} items from ${categoryName}` });
            return;
          }
        }
      }
    }

    setAddingToCart(true);
    try {
      const dateObj = new Date(eventDate);
      dateObj.setHours(18, 0, 0, 0);

      // Use package's inherent package_type_id, NOT the selected occasion/event type ID
      const packageTypeId = selectedPackage.package_type?.id;
      if (!packageTypeId) {
        setCartMessage({ type: 'error', text: 'Package type information is missing' });
        setAddingToCart(false);
        return;
      }

      const response = await userApi.createCartItem({
        package_id: selectedPackage.id,
        package_type_id: packageTypeId,
        location: selectedLocation,
        guests: guestCount,
        date: dateObj.toISOString(),
        price_at_time: (Number(selectedPackage.total_price) / selectedPackage.people_count) * guestCount,
      });

      if (response.data?.success) {
        setCartMessage({ type: 'success', text: 'Added to cart successfully!' });
        setTimeout(() => router.push('/user/cart'), 1500);
      } else {
        setCartMessage({ type: 'error', text: response.error || 'Failed to add to cart' });
      }
    } catch (err) {
      setCartMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!caterer) return <div className="min-h-screen flex items-center justify-center">Caterer not found</div>;

  const logoText = caterer.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 5);

  // Group items by category for the menu selection section
  const groupedItems = selectedPackage ? (selectedPackage.items || []).reduce((acc: any, item) => {
    const categoryName = item.dish?.category?.name || item.dish?.category || 'Uncategorized';
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(item);
    return acc;
  }, {}) : {};

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 font-medium">
          <Link href="/user/packages" className="hover:text-[#268700]">Menu</Link> / <span className="text-gray-900">Package Details</span>
        </div>

        {/* Caterer Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8 flex items-start gap-8">
          <div className="bg-blue-600 text-white flex items-center justify-center rounded-xl font-bold text-2xl w-32 h-32 flex-shrink-0">
            {logoText}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{caterer.name}</h1>
            <div className="flex gap-2 mb-4 flex-wrap">
              {caterer.cuisines?.map((cuisine: string) => (
                <span key={cuisine} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                  {cuisine}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1.5 border-r pr-6 border-gray-200">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-900">4.8</span>
                <span className="text-gray-400 font-medium">(89 reviews)</span>
              </div>

              <div className="flex items-center gap-2 border-r pr-6 border-gray-200">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{(caterer as any).minimum_guests || 10} - {(caterer as any).maximum_guests || 300} guests</span>
              </div>

              <div className="flex items-center gap-2 border-r pr-6 border-gray-200">
                <Truck className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  {(caterer as any).full_service ? 'Full service' :
                    (caterer as any).delivery_plus_setup ? 'Delivery & Setup' : 'Delivery only'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Responds &lt; 4 hours</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed max-w-4xl mb-4 italic">
              {caterer.description || 'Award-winning catering service specializing in high-quality food and impeccable service for your events.'}
            </p>

            <div className="text-lg font-bold text-gray-900">
              {caterer.priceRange}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <div className="flex">
            {[
              { id: 'setMenusFixed', label: 'Set Menus (Fixed)' },
              { id: 'setMenusCustomisable', label: 'Set Menus (Customisable)' },
              { id: 'buildYourOwn', label: 'Build Your Own' },
              { id: 'customiseMenu', label: 'Customise Menu' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedPackage(null); // Reset selection when tab changes
                }}
                className={`flex-1 py-4 text-xs font-bold transition-all border-b-2 ${activeTab === tab.id
                  ? 'border-[#268700] text-white bg-[#268700]'
                  : 'border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Main List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Select Package</h2>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">
                  {activeTab === 'setMenusFixed' ? 'Fixed Set Menus' : activeTab === 'setMenusCustomisable' ? 'Customisable Set Menus' : 'Packages'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {packages.filter(pkg => {
                    if (activeTab === 'setMenusFixed') return (pkg.customisation_type || '').includes('CUSTOM');
                    if (activeTab === 'setMenusCustomisable') return pkg.customisation_type === 'FIXED';
                    return false;
                  }).map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => handlePackageSelect(pkg)}
                      className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${selectedPackage?.id === pkg.id
                        ? 'border-[#268700] bg-green-50/10'
                        : 'border-gray-100 hover:border-gray-200'
                        }`}
                    >
                      <h4 className="font-bold text-gray-900 mb-1 pr-6">{pkg.name}</h4>
                      <p className="text-xs text-gray-400 mb-4">{pkg.package_type?.name || 'Package'}</p>

                      <div className="space-y-2 mb-6">
                        {/* Display categories like in screenshot */}
                        {[
                          'Welcome Drink',
                          'Starter',
                          'Main',
                          'Sides',
                          'Dessert'
                        ].map(cat => {
                          const itemsForCat = (pkg.items || []).filter(i =>
                            (i.dish?.category?.name || i.dish?.category || '').toLowerCase() === cat.toLowerCase()
                          );
                          return (
                            <div key={cat} className="flex gap-2 text-xs">
                              <span className="font-bold text-gray-900 shrink-0">{cat}:</span>
                              <span className="text-gray-500 truncate">
                                {itemsForCat.length > 0
                                  ? itemsForCat.map(i => i.dish?.name).join(', ')
                                  : 'Not specified'}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="font-bold text-gray-900 mb-1">AED {pkg.price_per_person}/person</div>
                        <div className="text-[10px] text-gray-400 uppercase font-black">Total for {guestCount} guests: <span className="text-[#268700]">AED {(pkg.price_per_person * guestCount).toLocaleString()}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inline Menu Selection */}
              {selectedPackage && (
                <div id="menu-items-section" className="mt-12 pt-8 border-t border-gray-100 animate-in fade-in duration-500">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-medium mb-2">
                      Menu Items {selectedPackage.customisation_type === 'FIXED' ? '(Select Items)' : '(Included)'}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4">
                      Package includes {(selectedPackage.items || []).length} items for {selectedPackage.people_count} people.
                    </p>

                    {loadingItems ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-8 h-8 border-4 border-green-200 border-t-[#268700] rounded-full animate-spin" />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Items...</p>
                      </div>
                    ) : (
                      /* List grouped by category - Exact UI from packageId/page.tsx */
                      <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
                        {Object.entries(groupedItems).map(([category, items]: [string, any], categoryIndex) => {
                          const isFixedWithLimits = selectedPackage.customisation_type === 'FIXED' && (selectedPackage.category_selections?.length || 0) > 0;
                          const selection = selectedPackage.category_selections?.find(s => (s.category?.name || s.category).toLowerCase() === category.toLowerCase());
                          const categoryLimit = selection?.num_dishes_to_select;
                          const selectedInCategory = Array.from(selectedDishIds).filter(id => {
                            const item = (selectedPackage.items || []).find(i => i.dish?.id === id);
                            return (item?.dish?.category?.name || item?.dish?.category)?.toLowerCase() === category.toLowerCase();
                          }).length;

                          return (
                            <div key={category} className="mb-0">
                              {/* Category Header with light grey background */}
                              <div className="bg-gray-100 py-2 px-4 font-semibold text-gray-900 flex items-center justify-between">
                                <span className="text-sm">{category}</span>
                                {selectedPackage.customisation_type === 'FIXED' && categoryLimit !== null && (
                                  <span className="text-xs font-normal text-gray-600">
                                    {selectedInCategory} / {categoryLimit} selected
                                  </span>
                                )}
                              </div>

                              {/* Dishes List */}
                              <div className="bg-white">
                                {items.map((item: any, itemIndex: number) => {
                                  const dishId = item.dish?.id;
                                  const isSelected = selectedDishIds.has(dishId);
                                  const isCustomisable = selectedPackage.customisation_type === 'FIXED';
                                  const selectable = isCustomisable;

                                  const isAtLimit = isCustomisable && categoryLimit !== null && selectedInCategory >= categoryLimit && !isSelected;

                                  return (
                                    <div
                                      key={item.id}
                                      onClick={() => selectable && !isAtLimit && toggleDishSelection(dishId, category)}
                                      className={`py-3 px-4 border-b border-gray-200 last:border-b-0 ${selectable && !isAtLimit ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                                        } ${isSelected ? 'bg-green-50/50' : ''} ${isAtLimit ? 'opacity-50' : ''}`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700 font-medium">
                                          {item.dish?.name}
                                          {item.quantity > 1 && (
                                            <span className="text-gray-500 ml-2">(x{item.quantity})</span>
                                          )}
                                        </span>
                                        {selectable && (
                                          <div className="ml-4">
                                            {isSelected ? (
                                              <Check className="w-5 h-5 text-[#268700]" />
                                            ) : (
                                              <div className={`w-5 h-5 border-2 rounded ${isAtLimit ? 'border-gray-200' : 'border-gray-300'}`} />
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      {item.dish?.description && (
                                        <p className="text-xs text-gray-400 mt-1">{item.dish.description}</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Event Details</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Event Type *</label>
                  <select
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#268700] transition-all"
                  >
                    <option value="">Select Event Type</option>
                    {occasions.map((occ) => (
                      <option key={occ.id} value={occ.id}>{occ.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location *</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#268700] transition-all"
                  >
                    <option value="">Select Location</option>
                    <option value="Dubai Marina">Dubai Marina</option>
                    <option value="Downtown Dubai">Downtown Dubai</option>
                    <option value="JLT">JLT</option>
                    <option value="Palm Jumeirah">Palm Jumeirah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Number of Guests *</label>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#268700] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Event Date *</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#268700] transition-all"
                  />
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estimated Total</div>
                  <div className="text-2xl font-black text-gray-900">AED {(selectedPackage ? (Number(selectedPackage.total_price) / selectedPackage.people_count) * guestCount : 1200).toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">{guestCount} guests</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] px-6 py-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Total Amount</span>
            <span className="text-2xl font-black text-gray-900">AED {(selectedPackage ? (Number(selectedPackage.total_price) / selectedPackage.people_count) * guestCount : 1200).toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-6">
            {cartMessage && (
              <div className={`text-sm font-bold ${cartMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {cartMessage.text}
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={!selectedPackage || addingToCart}
              className={`px-12 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${!selectedPackage || addingToCart
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#268700] text-white hover:bg-[#1f6b00]'
                }`}
            >
              {addingToCart ? 'Processing...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Plus(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  );
}

export default function CatererMenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CatererMenuContent />
    </Suspense>
  );
}
