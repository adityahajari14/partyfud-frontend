'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  Users,
  Truck,
  Clock,
  Check,
  ChevronRight,
  MapPin,
  Settings2,
  Calendar,
  X,
  Info
} from 'lucide-react';
import { userApi, type Package, type Occasion } from '@/lib/api/user.api';
import { useAuth } from '@/contexts/AuthContext';

function CatererMenuContent() {
  const [activeTab, setActiveTab] = useState('setMenus');
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
          userApi.getAllOccasions()
        ]);

        if (catererRes.data?.data) {
          setCaterer(catererRes.data.data);
          setPackages(catererRes.data.data.packages || []);
        }
        if (occasionsRes.data?.data) {
          setOccasions(occasionsRes.data.data);
        }
      } catch (err) {
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

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    // Pre-select all items by default for non-customizable packages
    const allDishIds = new Set(pkg.items.map(i => i.dish?.id).filter(Boolean));
    setSelectedDishIds(allDishIds);

    // Smooth scroll to menu section
    setTimeout(() => {
      document.getElementById('menu-items-scroll-target')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const toggleDishSelection = (dishId: string, categoryName: string) => {
    if (!selectedPackage) return;

    const isCustomizable = selectedPackage.customisation_type?.includes('CUSTOM');
    const isFixedWithLimits = selectedPackage.customisation_type === 'FIXED' && (selectedPackage.category_selections?.length || 0) > 0;

    if (!isCustomizable && !isFixedWithLimits) return;

    const newSelected = new Set(selectedDishIds);
    if (newSelected.has(dishId)) {
      newSelected.delete(dishId);
    } else {
      if (isFixedWithLimits) {
        const selection = selectedPackage.category_selections?.find(
          cs => (cs.category?.name || cs.category).toLowerCase() === categoryName.toLowerCase()
        );
        const limit = selection?.num_dishes_to_select;

        if (limit) {
          const currentCount = Array.from(newSelected).filter(id => {
            const item = selectedPackage.items.find(i => i.dish?.id === id);
            return (item?.dish?.category?.name || item?.dish?.category)?.toLowerCase() === categoryName.toLowerCase();
          }).length;

          if (currentCount >= limit) {
            setCartMessage({ type: 'error', text: `You can only select ${limit} items from ${categoryName}` });
            setTimeout(() => setCartMessage(null), 3000);
            return;
          }
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

    setAddingToCart(true);
    try {
      const response = await userApi.createCartItem({
        package_id: selectedPackage.id,
        package_type_id: selectedEventType || selectedPackage.package_type?.id,
        location: selectedLocation,
        guests: guestCount,
        date: new Date(eventDate).toISOString(),
        price_at_time: (selectedPackage.total_price / selectedPackage.people_count) * guestCount,
      });

      if (response.data?.success) {
        setCartMessage({ type: 'success', text: 'Success! Redirecting to cart...' });
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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-medium text-gray-500">Loading caterer info...</div>;
  if (!caterer) return <div className="min-h-screen flex items-center justify-center font-medium text-gray-500 underline"><Link href="/user/packages">Caterer not found. Go back.</Link></div>;

  const logoText = caterer.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 5);

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-32">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        {/* Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/user/packages" className="hover:text-gray-900 transition-colors">Menu</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-semibold tracking-tight">Package Details</span>
        </div>

        {/* Premium Header */}
        <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
          <div className="bg-[#2B63FF] text-white flex items-center justify-center rounded-2xl font-black text-3xl w-32 h-32 md:w-36 md:h-36 flex-shrink-0 shadow-[0_8px_30px_rgb(43,99,255,0.2)]">
            {logoText}
          </div>
          <div className="flex-1 pt-1">
            <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">{caterer.name}</h1>

            <div className="flex gap-2 mb-6">
              {caterer.cuisines?.map((cuisine: string) => (
                <span key={cuisine} className="text-[10px] bg-white border border-gray-100 text-gray-500 px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                  {cuisine}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#FFB800] fill-[#FFB800]" />
                <span className="font-bold text-gray-900">4.8</span>
                <span className="text-gray-300">(89 reviews)</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">{(caterer as any).minimum_guests || 10} - {(caterer as any).maximum_guests || 300} guests</span>
              </div>

              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">
                  {(caterer as any).full_service ? 'Full service including staff' :
                    (caterer as any).delivery_plus_setup ? 'Delivery & Setup' : 'Delivery only'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">Responds &lt; 4 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-10 w-fit">
          {['setMenus', 'buildYourOwn', 'customiseMenu'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === tab
                  ? 'bg-[#268700] text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              {tab === 'setMenus' ? 'Set Menus' : tab === 'buildYourOwn' ? 'Build Your Own' : 'Customise Menu'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Select Package</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Fixed Packages</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => handlePackageSelect(pkg)}
                      className={`group relative p-8 rounded-3xl border-2 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 ${selectedPackage?.id === pkg.id
                          ? 'border-[#268700] bg-green-50/5'
                          : 'border-gray-50 bg-white'
                        }`}
                    >
                      {selectedPackage?.id === pkg.id && (
                        <div className="absolute top-6 right-6 bg-[#268700] rounded-full p-1.5 shadow-lg shadow-green-200">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <h4 className="text-lg font-black text-gray-900 mb-2 pr-8 leading-tight">{pkg.name}</h4>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-6">{pkg.package_type}</div>

                      <div className="space-y-3 mb-8">
                        {pkg.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex gap-2 text-xs">
                            <span className="font-bold text-gray-900 shrink-0">
                              {item.dish?.category?.name || item.dish?.category}:
                            </span>
                            <span className="text-gray-500 truncate">{item.dish?.name}</span>
                          </div>
                        ))}
                        {pkg.items.length > 3 && (
                          <div className="flex items-center gap-1 text-[10px] font-black text-[#268700] uppercase pt-1 tracking-widest">
                            <Plus className="w-3 h-3" /> {pkg.items.length - 3} more items
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col pt-6 border-t border-gray-50">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Price per person</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-gray-900 tracking-tighter">AED {pkg.price_per_person}</span>
                          <span className="text-xs text-gray-400">/person</span>
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 mt-2">Total for {pkg.people_count} guests: <span className="text-gray-900 font-black">AED {pkg.total_price.toLocaleString()}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inline Menu Selection */}
            {selectedPackage && (
              <div id="menu-items-scroll-target" className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="p-10 border-b border-gray-50 bg-[#F9FAFB]/50 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Menu Items</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-gray-900 text-[10px] text-white font-black uppercase tracking-wider">{selectedPackage.items.length} dishes</span>
                      <span className="text-xs text-gray-400 font-medium">for {selectedPackage.people_count} people</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <Settings2 className="w-6 h-6 text-gray-300 mb-2" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedPackage.customisation_type?.includes('CUSTOM') ? 'Customizable' : 'Fixed Menu'}</span>
                  </div>
                </div>

                <div className="divide-y divide-gray-50">
                  {Object.entries(
                    selectedPackage.items.reduce((acc: any, item) => {
                      const cat = item.dish?.category?.name || item.dish?.category || 'Other';
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(item);
                      return acc;
                    }, {})
                  ).map(([category, items]: [string, any], catIdx) => {
                    const isCustomizable = selectedPackage.customisation_type?.includes('CUSTOM');
                    const isFixedWithLimits = selectedPackage.customisation_type === 'FIXED' && (selectedPackage.category_selections?.length || 0) > 0;

                    return (
                      <div key={category} className={catIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}>
                        <div className="px-10 py-5 flex items-center justify-between sticky top-0 bg-inherit/90 backdrop-blur-sm z-10">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{category}</h3>
                          {isFixedWithLimits && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-[#268700]/10 rounded-full">
                              <Info className="w-3 h-3 text-[#268700]" />
                              <span className="text-[10px] font-black text-[#268700] uppercase tracking-wider">
                                Choose {selectedPackage.category_selections?.find(s => (s.category?.name || s.category).toLowerCase() === category.toLowerCase())?.num_dishes_to_select || 'Items'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="divide-y divide-gray-50 px-6 pb-6">
                          {items.map((item: any) => {
                            const isSelected = selectedDishIds.has(item.dish?.id);
                            const selectable = isCustomizable || isFixedWithLimits;

                            return (
                              <div
                                key={item.id}
                                onClick={() => selectable && toggleDishSelection(item.dish?.id, category)}
                                className={`px-4 py-5 rounded-2xl flex items-center justify-between transition-all ${selectable ? 'cursor-pointer hover:bg-white hover:shadow-md' : 'cursor-default'
                                  } ${isSelected ? 'bg-white shadow-sm ring-1 ring-green-100' : ''}`}
                              >
                                <div className="flex items-center gap-5">
                                  <div className={`w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 font-black text-xs overflow-hidden`}>
                                    {item.dish?.image_url ? (
                                      <img src={item.dish.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : item.dish?.name?.charAt(0)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-900">{item.dish?.name}</span>
                                    {item.dish?.description && <span className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">{item.dish.description}</span>}
                                  </div>
                                </div>
                                {selectable ? (
                                  <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#268700] border-[#268700] rotate-0 scale-100 shadow-lg shadow-green-100' : 'border-gray-100 rotate-90 scale-95 hover:border-gray-200'
                                    }`}>
                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                  </div>
                                ) : (
                                  <div className="px-2 py-1 rounded bg-green-50 text-[10px] font-black text-[#268700] uppercase tracking-tighter">Included</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100 sticky top-10">
              <h2 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Event Details</h2>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Event Type *</label>
                  <div className="relative">
                    <select
                      value={selectedEventType}
                      onChange={(e) => setSelectedEventType(e.target.value)}
                      className="w-full appearance-none pl-6 pr-10 py-4 rounded-2xl bg-gray-50 border border-gray-50 focus:bg-white focus:ring-4 focus:ring-[#268700]/5 focus:border-[#268700] transition-all text-sm font-bold text-gray-700"
                    >
                      <option value="">Select Event Type</option>
                      {occasions.map((occ) => (
                        <option key={occ.id} value={occ.id}>{occ.name}</option>
                      ))}
                    </select>
                    <Settings2 className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Location *</label>
                  <div className="relative">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full appearance-none pl-6 pr-10 py-4 rounded-2xl bg-gray-50 border border-gray-50 focus:bg-white focus:ring-4 focus:ring-[#268700]/5 focus:border-[#268700] transition-all text-sm font-bold text-gray-700"
                    >
                      <option value="">Select Location</option>
                      <option value="Dubai Marina">Dubai Marina</option>
                      <option value="Downtown Dubai">Downtown Dubai</option>
                      <option value="JLT">JLT</option>
                      <option value="Palm Jumeirah">Palm Jumeirah</option>
                      <option value="Business Bay">Business Bay</option>
                    </select>
                    <MapPin className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Guests *</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={guestCount}
                        onChange={(e) => setGuestCount(parseInt(e.target.value))}
                        className="w-full pl-6 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-50 focus:bg-white focus:ring-4 focus:ring-[#268700]/5 focus:border-[#268700] transition-all text-sm font-black text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Date *</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-4 py-4 rounded-2xl bg-gray-50 border border-gray-50 focus:bg-white focus:ring-4 focus:ring-[#268700]/5 focus:border-[#268700] transition-all text-xs font-bold text-gray-700"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none md:hidden" />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Estimated Total</span>
                    <span className="text-2xl font-black text-gray-900 tracking-tighter">
                      AED {(selectedPackage ? (selectedPackage.total_price / selectedPackage.people_count) * guestCount : 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold">{guestCount} guests x AED {(selectedPackage ? (selectedPackage.total_price / selectedPackage.people_count) : 0).toLocaleString()}</span>
                    <div className="px-2 py-0.5 rounded bg-blue-50 text-[10px] text-blue-600 font-black uppercase tracking-widest">Calculated</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Bottom Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 z-[100]">
        <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-4 pr-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between text-white overflow-hidden relative">
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]" />

          <div className="flex items-center gap-8 pl-6 relative">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Total Amount</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tighter leading-none">
                  AED {(selectedPackage ? (selectedPackage.total_price / selectedPackage.people_count) * guestCount : 0).toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{guestCount} guests</span>
              </div>
            </div>

            {selectedPackage && (
              <div className="hidden md:flex flex-col border-l border-white/10 pl-8">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Selected Package</span>
                <span className="text-xs font-bold text-green-400 truncate max-w-[120px]">{selectedPackage.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 relative">
            {cartMessage && (
              <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest animate-in slide-in-from-bottom-2 ${cartMessage.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'
                }`}>
                {cartMessage.text}
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={!selectedPackage || addingToCart}
              className={`group flex items-center gap-3 px-10 py-5 rounded-[1.75rem] font-black text-sm uppercase tracking-[0.15em] transition-all shadow-[0_10px_20px_rgba(38,135,0,0.2)] active:scale-95 ${!selectedPackage || addingToCart
                  ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                  : 'bg-[#268700] text-white hover:bg-[#1f6b00] hover:shadow-[0_15px_30px_rgba(38,135,0,0.4)]'
                }`}
            >
              {addingToCart ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                <>
                  {selectedPackage ? 'Add to Cart' : 'Pick a Package'}
                  <ChevronRight className={`w-4 h-4 transition-transform ${selectedPackage ? 'group-hover:translate-x-1' : ''}`} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shine {
          0% { transform: translateX(-150%) skewX(-20deg); }
          50% { transform: translateX(150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
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
