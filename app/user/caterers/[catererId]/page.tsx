'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { userApi, type Caterer, type Package, type Dish } from '@/lib/api/user.api';
import { Check, Plus, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type TabType = 'setMenus' | 'buildYourOwn' | 'customiseMenu';
type DietaryFilter = 'veg' | 'glutenFree' | 'nonVeg' | 'sugarFree' | null;

interface CategoryGroup {
  categoryName: string;
  dishes: Dish[];
  maxSelections?: number;
}

export default function CatererMenuPage() {
  const { catererId } = useParams<{ catererId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [caterer, setCaterer] = useState<Caterer | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('setMenus');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [guestCount, setGuestCount] = useState<number>(50);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set());
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>(null);
  const [loadingDishes, setLoadingDishes] = useState(false);

  // Event details form states (for Set Menus tab)
  const [eventType, setEventType] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [occasions, setOccasions] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingOccasions, setLoadingOccasions] = useState(false);

  // Custom Proposal Form States
  const [proposalGuestCount, setProposalGuestCount] = useState<number>(50);
  const [proposalEventType, setProposalEventType] = useState<string>('');
  const [proposalLocation, setProposalLocation] = useState<string>('12/345 Business Bay');
  const [selectedDietaryPreferences, setSelectedDietaryPreferences] = useState<Set<string>>(new Set(['Gluten Free', 'Sugar Free']));
  const [budgetPerPerson, setBudgetPerPerson] = useState<string>('AED 12');
  const [proposalEventDate, setProposalEventDate] = useState<string>('2024-12-12');
  const [vision, setVision] = useState<string>('');
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [showProposalSuccessModal, setShowProposalSuccessModal] = useState(false);

  // Fetch occasions
  useEffect(() => {
    const fetchOccasions = async () => {
      setLoadingOccasions(true);
      try {
        const response = await userApi.getOccasions();
        if (response.data?.data) {
          setOccasions(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching occasions:', err);
      } finally {
        setLoadingOccasions(false);
      }
    };
    fetchOccasions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!catererId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch caterer and packages in parallel
        const [catererResponse, packagesResponse] = await Promise.all([
          userApi.getCatererById(catererId),
          userApi.getPackagesByCatererId(catererId),
        ]);

        if (catererResponse.error) {
          setError(catererResponse.error);
        } else if (catererResponse.data?.data) {
          setCaterer(catererResponse.data.data);
        }

        if (packagesResponse.error) {
          console.error('Error fetching packages:', packagesResponse.error);
        } else if (packagesResponse.data?.data) {
          const fetchedPackages = packagesResponse.data.data;
          setPackages(fetchedPackages);
          // Auto-select first package if available
          if (fetchedPackages.length > 0) {
            setSelectedPackage(fetchedPackages[0]);
            setGuestCount(fetchedPackages[0].people_count);
          }
        }
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [catererId]);

  // Format menu items for display
  const formatMenuItems = (pkg: Package) => {
    if (!pkg.items || pkg.items.length === 0) {
      return {
        welcomeDrink: 'Not specified',
        starter: 'Not specified',
        main: 'Not specified',
        sides: 'Not specified',
        dessert: 'Not specified',
      };
    }

    const items = pkg.items.map((item: any) => ({
      name: item.dish?.name || 'Unknown',
      category: item.dish?.category?.name || item.dish?.category || 'Other',
      isOptional: item.is_optional,
    }));

    // Group by category and find typical items
    const categories: { [key: string]: string[] } = {};
    items.forEach((item) => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item.name);
    });

    // Try to identify items by category name patterns
    const getItemsByPattern = (patterns: string[]) => {
      for (const pattern of patterns) {
        const category = Object.keys(categories).find(cat =>
          cat.toLowerCase().includes(pattern.toLowerCase())
        );
        if (category && categories[category].length > 0) {
          return categories[category].join(', ');
        }
      }
      return null;
    };

    const welcomeDrink = getItemsByPattern(['drink', 'beverage', 'welcome']) ||
      categories['Beverages']?.[0] ||
      items.find(i => i.name.toLowerCase().includes('drink') || i.name.toLowerCase().includes('lemonade') || i.name.toLowerCase().includes('tea'))?.name ||
      'Not specified';

    const starter = getItemsByPattern(['starter', 'appetizer', 'mezze']) ||
      categories['Starters']?.[0] ||
      categories['Appetizers']?.[0] ||
      items.find(i => i.name.toLowerCase().includes('starter') || i.name.toLowerCase().includes('mezze') || i.name.toLowerCase().includes('bruschetta'))?.name ||
      'Not specified';

    const main = getItemsByPattern(['main', 'entree', 'course']) ||
      categories['Main Course']?.[0] ||
      categories['Mains']?.[0] ||
      items.find(i => !i.name.toLowerCase().includes('drink') && !i.name.toLowerCase().includes('starter') && !i.name.toLowerCase().includes('dessert') && !i.name.toLowerCase().includes('side'))?.name ||
      'Not specified';

    const sides = getItemsByPattern(['side', 'accompaniment']) ||
      categories['Sides']?.[0] ||
      categories['Accompaniments']?.[0] ||
      items.filter(i => i.name.toLowerCase().includes('rice') || i.name.toLowerCase().includes('salad') || i.name.toLowerCase().includes('bread')).map(i => i.name).join(', ') ||
      'Not specified';

    const dessert = getItemsByPattern(['dessert', 'sweet']) ||
      categories['Desserts']?.[0] ||
      categories['Sweets']?.[0] ||
      items.find(i => i.name.toLowerCase().includes('dessert') || i.name.toLowerCase().includes('tiramisu') || i.name.toLowerCase().includes('baklava') || i.name.toLowerCase().includes('churros'))?.name ||
      'Not specified';

    return { welcomeDrink, starter, main, sides, dessert };
  };

  // Fetch dishes when Build Your Own tab is active
  useEffect(() => {
    const fetchDishes = async () => {
      if (!catererId || activeTab !== 'buildYourOwn') return;

      setLoadingDishes(true);
      try {
        const response = await userApi.getDishesByCatererId(catererId);
        if (response.error) {
          console.error('Error fetching dishes:', response.error);
        } else if (response.data?.data) {
          setDishes(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching dishes:', err);
      } finally {
        setLoadingDishes(false);
      }
    };

    fetchDishes();
  }, [catererId, activeTab]);

  // Group dishes by category
  const groupDishesByCategory = (): CategoryGroup[] => {
    const grouped: { [key: string]: Dish[] } = {};

    let filteredDishes = dishes;

    // Apply dietary filter (simplified - you may need to add dietary info to dishes)
    if (dietaryFilter === 'veg') {
      // Filter vegetarian dishes (you'll need to add this field to your dish model)
      filteredDishes = dishes.filter(d => {
        const name = d.name.toLowerCase();
        return !name.includes('chicken') && !name.includes('beef') && !name.includes('lamb') &&
          !name.includes('pork') && !name.includes('fish') && !name.includes('meat');
      });
    } else if (dietaryFilter === 'nonVeg') {
      filteredDishes = dishes.filter(d => {
        const name = d.name.toLowerCase();
        return name.includes('chicken') || name.includes('beef') || name.includes('lamb') ||
          name.includes('pork') || name.includes('fish') || name.includes('meat');
      });
    }

    filteredDishes.forEach((dish) => {
      const categoryName = dish.category?.name || 'Other';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(dish);
    });

    // Convert to array - allow multiple selections
    return Object.entries(grouped).map(([categoryName, categoryDishes]) => {
      return {
        categoryName,
        dishes: categoryDishes,
        maxSelections: undefined, // No limit - allow multiple selections
      };
    });
  };

  // Toggle dish selection
  const toggleDishSelection = (dishId: string, categoryGroup: CategoryGroup) => {
    const newSelected = new Set(selectedDishes);

    // Check if dish is already selected
    if (newSelected.has(dishId)) {
      newSelected.delete(dishId);
    } else {
      // Allow multiple selections - no limit
      newSelected.add(dishId);
    }

    setSelectedDishes(newSelected);
  };

  // Check if dish is selected
  const isDishSelected = (dishId: string) => {
    return selectedDishes.has(dishId);
  };

  // Calculate total price for Build Your Own
  const calculateBuildYourOwnTotal = () => {
    let total = 0;
    selectedDishes.forEach((dishId) => {
      const dish = dishes.find(d => d.id === dishId);
      if (dish) {
        // Assuming dish.price is per person, multiply by guest count
        total += Number(dish.price) * guestCount;
      }
    });
    return total;
  };

  // Calculate total price
  const calculateTotal = () => {
    if (activeTab === 'buildYourOwn') {
      return calculateBuildYourOwnTotal();
    }
    if (!selectedPackage) return 0;
    const pricePerPerson = selectedPackage.price_per_person;
    return pricePerPerson * guestCount;
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (activeTab === 'buildYourOwn') {
      if (selectedDishes.size === 0 || !catererId) return;

      // Check if user is authenticated
      if (!user) {
        alert('You must be logged in to create a package. Please log in and try again.');
        router.push('/login');
        return;
      }

      setAddingToCart(true);
      try {
        // Convert selected dishes Set to array
        const dishIds = Array.from(selectedDishes);

        // Create custom package
        const response = await userApi.createCustomPackage({
          dish_ids: dishIds,
          people_count: guestCount,
        });

        if (response.error) {
          // Check if it's an authentication error
          if (response.status === 401 || response.error.includes('Unauthorized') || response.error.includes('401')) {
            alert('Your session has expired. Please log in again.');
            router.push('/login');
            return;
          }
          alert(response.error || 'Failed to create custom package. Please try again.');
          return;
        }

        if (response.data?.success && response.data?.data) {
          // Show success message and redirect to package details page
          const newPackageId = response.data?.data?.id;
          if (newPackageId) {
            alert('Package created successfully! Redirecting to package details...');
            router.push(`/user/mypackages/${newPackageId}`);
          } else {
            alert('Package created successfully! Go to My packages!');
            router.push('/user/mypackages');
          }
        } else if (response.data?.data) {
          // Handle case where success might not be in response but data exists
          const newPackageId = response.data?.data?.id;
          if (newPackageId) {
            alert('Package created successfully! Redirecting to package details...');
            router.push(`/user/mypackages/${newPackageId}`);
          } else {
            alert('Package created successfully! Go to My packages!');
            router.push('/user/mypackages');
          }
        } else {
          alert('Failed to create custom package. Please try again.');
        }
      } catch (err: any) {
        console.error('Error creating custom package:', err);
        // Check if it's an authentication error
        if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
          alert('Your session has expired. Please log in again.');
          router.push('/login');
        } else {
          alert(err?.message || 'Failed to create custom package. Please try again.');
        }
      } finally {
        setAddingToCart(false);
      }
    } else {
      if (!selectedPackage || !catererId) return;

      // Validate required fields
      if (!eventType || !location || !eventDate) {
        alert('Please fill in all event details (Event Type, Location, and Date) before proceeding.');
        return;
      }

      setAddingToCart(true);
      try {
        // Navigate to package details page with all form data as query params
        const params = new URLSearchParams({
          guests: guestCount.toString(),
          eventType: eventType,
          location: location,
          date: eventDate,
        });
        router.push(`/user/caterers/${catererId}/${selectedPackage.id}?${params.toString()}`);
      } catch (err) {
        console.error('Error navigating to package:', err);
      } finally {
        setAddingToCart(false);
      }
    }
  };

  // Get logo info
  const getLogoInfo = (name: string) => {
    const words = name.split(' ');
    const logoText = words.length > 1
      ? words[0].substring(0, 5).toUpperCase()
      : name.substring(0, 5).toUpperCase();
    return { logoText };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !caterer) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-gray-500">{error || 'Caterer not found.'}</p>
      </div>
    );
  }

  const { logoText } = getLogoInfo(caterer.name);

  return (
    <section className="bg-[#fafafa] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Link href="/user/caterers" className="underline cursor-pointer">Menu</Link>
            <span>/</span>
            <span>Package Details</span>
          </div>

          {/* Caterer Header */}
          <div className="flex items-start gap-6 mb-6">
            <div className="bg-blue-600 text-white text-center py-8 px-6 rounded-lg font-bold text-xl min-w-[120px]">
              {logoText}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{caterer.name}</h1>
              <div className="flex gap-2 mb-2 flex-wrap">
                {caterer.cuisines.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                ⭐ {packages.length > 0 && packages[0]?.rating
                  ? typeof packages[0].rating === 'number'
                    ? packages[0].rating.toFixed(1)
                    : parseFloat(String(packages[0].rating)).toFixed(1)
                  : 'N/A'}
              </div>

              {/* Capacity & Service Details - Inline */}
              <div className="flex flex-wrap gap-4 mb-3 items-center">
                {(caterer as any).minimum_guests && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Min:</span>
                    <span className="text-sm font-semibold text-[#268700]">{(caterer as any).minimum_guests}</span>
                    <span className="text-xs text-gray-500">guests</span>
                  </div>
                )}
                {(caterer as any).maximum_guests && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Max:</span>
                    <span className="text-sm font-semibold text-[#268700]">{(caterer as any).maximum_guests}</span>
                    <span className="text-xs text-gray-500">guests</span>
                  </div>
                )}
                {(caterer as any).staff && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Staff:</span>
                    <span className="text-sm font-semibold text-[#268700]">{(caterer as any).staff}</span>
                  </div>
                )}
                {(caterer as any).servers && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Servers:</span>
                    <span className="text-sm font-semibold text-[#268700]">{(caterer as any).servers}</span>
                  </div>
                )}
                {((caterer as any).delivery_only || (caterer as any).delivery_plus_setup || (caterer as any).full_service) && (
                  <div className="flex items-center gap-2">
                    {(caterer as any).delivery_only && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        🚚 Delivery
                      </span>
                    )}
                    {(caterer as any).delivery_plus_setup && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        🚚 Setup
                      </span>
                    )}
                    {(caterer as any).full_service && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        ⭐ Full Service
                      </span>
                    )}
                  </div>
                )}
              </div>


              <p className="text-sm text-gray-600 mb-2">
                {caterer.description || 'Award-winning catering service specializing in Mediterranean and French cuisine. We bring restaurant-quality food to your events with impeccable service.'}
              </p>
              <p className="font-semibold text-gray-900">{caterer.priceRange}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 w-full px-4 bg-white">
            <button
              onClick={() => setActiveTab('setMenus')}
              className={`flex-1 py-3 text-base font-semibold rounded-lg transition ${activeTab === 'setMenus'
                ? 'bg-[#268700] text-white shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              Set Menus
            </button>
            <button
              onClick={() => setActiveTab('buildYourOwn')}
              className={`flex-1 py-3 text-base font-semibold rounded-lg transition ${activeTab === 'buildYourOwn'
                ? 'bg-[#268700] text-white shadow-md'
                : 'bg-white text-gray-700  border-gray-300 hover:bg-gray-50'
                }`}
            >
              Build Your Own
            </button>
            <button
              onClick={() => setActiveTab('customiseMenu')}
              className={`flex-1 py-3 text-base font-semibold rounded-lg transition ${activeTab === 'customiseMenu'
                ? 'bg-[#268700] text-white shadow-md'
                : 'bg-white text-gray-700  border-gray-300 hover:bg-gray-50'
                }`}
            >
              Customise Menu
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'setMenus' && (
          <div className="pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
              {/* Left Column - Packages */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Select Package</h2>
                </div>

                {/* Group packages by customisation_type */}
                {(() => {
                  const fixedPackages = packages.filter(
                    (pkg) => !pkg.customisation_type || pkg.customisation_type === 'FIXED'
                  );
                  const customisablePackages = packages.filter(
                    (pkg) => pkg.customisation_type === 'CUSTOMISABLE' || pkg.customisation_type === 'CUSTOMIZABLE'
                  );

                  const renderPackageCard = (pkg: Package) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    const menuItems = formatMenuItems(pkg);
                    const totalPrice = pkg.price_per_person * guestCount;

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`bg-white border-2 rounded-lg p-3 cursor-pointer transition ${isSelected
                          ? 'border-[#268700] bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                      >
                        <h3 className="font-semibold text-base text-gray-900 mb-1">{pkg.name}</h3>
                        <p className="text-xs text-gray-600 mb-3">{pkg.package_type?.name || 'Package'}</p>

                        <div className="space-y-1.5 text-xs text-gray-700 mb-3">
                          <div className="line-clamp-1">
                            <span className="font-medium">Welcome Drink:</span> <span className="text-gray-600">{menuItems.welcomeDrink}</span>
                          </div>
                          <div className="line-clamp-1">
                            <span className="font-medium">Starter:</span> <span className="text-gray-600">{menuItems.starter}</span>
                          </div>
                          <div className="line-clamp-1">
                            <span className="font-medium">Main:</span> <span className="text-gray-600">{menuItems.main}</span>
                          </div>
                          <div className="line-clamp-1">
                            <span className="font-medium">Sides:</span> <span className="text-gray-600">{menuItems.sides}</span>
                          </div>
                          <div className="line-clamp-1">
                            <span className="font-medium">Dessert:</span> <span className="text-gray-600">{menuItems.dessert}</span>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm text-gray-900 flex items-center gap-1">
                              <img src="/dirham.svg" alt="AED" className="w-4 h-4" />
                              {pkg.price_per_person.toLocaleString()}/person
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            Total for {guestCount} guests: <span className="font-semibold text-gray-900 flex items-center gap-1"><img src="/dirham.svg" alt="AED" className="w-3 h-3" />{totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  };

                  if (packages.length === 0) {
                    return (
                      <div className="text-center py-10">
                        <p className="text-gray-500">No packages available for this caterer.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-8">
                      {/* Fixed Packages Section */}
                      {fixedPackages.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fixed Packages</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {fixedPackages.map(renderPackageCard)}
                          </div>
                        </div>
                      )}

                      {/* Customisable Packages Section */}
                      {customisablePackages.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customisable Packages</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {customisablePackages.map(renderPackageCard)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Right Column - Event Details Form */}
              <aside className="bg-white border border-gray-200 rounded-xl p-5 h-fit">
                <h3 className="font-semibold text-lg mb-4">Event Details</h3>

                {/* Event Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="eventType"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#268700]"
                    disabled={loadingOccasions}
                  >
                    <option value="" className="text-black">
                      {loadingOccasions ? 'Loading...' : 'Select Event Type'}
                    </option>
                    {occasions.map((occasion) => (
                      <option key={occasion.id} value={occasion.id} className="text-black">
                        {occasion.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#268700]"
                  >
                    <option value="" className="text-black">Select Location</option>
                    <option value="Downtown Dubai" className="text-black">Downtown Dubai</option>
                    <option value="Dubai Marina" className="text-black">Dubai Marina</option>
                    <option value="Jumeirah" className="text-black">Jumeirah</option>
                    <option value="Palm Jumeirah" className="text-black">Palm Jumeirah</option>
                    <option value="Business Bay" className="text-black">Business Bay</option>
                    <option value="Dubai International Financial Centre (DIFC)" className="text-black">Dubai International Financial Centre (DIFC)</option>
                    <option value="Dubai Mall Area" className="text-black">Dubai Mall Area</option>
                    <option value="Burj Al Arab Area" className="text-black">Burj Al Arab Area</option>
                    <option value="Dubai Festival City" className="text-black">Dubai Festival City</option>
                    <option value="Dubai Sports City" className="text-black">Dubai Sports City</option>
                    <option value="Dubai Media City" className="text-black">Dubai Media City</option>
                    <option value="Dubai Internet City" className="text-black">Dubai Internet City</option>
                    <option value="Dubai Knowledge Park" className="text-black">Dubai Knowledge Park</option>
                    <option value="Dubai Healthcare City" className="text-black">Dubai Healthcare City</option>
                    <option value="Dubai World Trade Centre" className="text-black">Dubai World Trade Centre</option>
                    <option value="Dubai Creek" className="text-black">Dubai Creek</option>
                    <option value="Deira" className="text-black">Deira</option>
                    <option value="Bur Dubai" className="text-black">Bur Dubai</option>
                    <option value="Al Barsha" className="text-black">Al Barsha</option>
                    <option value="Jumeirah Beach Residence (JBR)" className="text-black">Jumeirah Beach Residence (JBR)</option>
                    <option value="Dubai Hills" className="text-black">Dubai Hills</option>
                    <option value="Arabian Ranches" className="text-black">Arabian Ranches</option>
                    <option value="Emirates Hills" className="text-black">Emirates Hills</option>
                    <option value="Dubai Silicon Oasis" className="text-black">Dubai Silicon Oasis</option>
                    <option value="Dubai Production City" className="text-black">Dubai Production City</option>
                    <option value="Dubai Studio City" className="text-black">Dubai Studio City</option>
                  </select>
                </div>

                {/* Guests */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={guestCount}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value > 0) {
                        setGuestCount(value);
                      }
                    }}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#268700]"
                    placeholder="50"
                  />
                </div>

                {/* Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#268700]"
                  />
                </div>

                {/* Total Cost Preview */}
                {selectedPackage && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="font-semibold text-sm text-gray-700 mb-1">Estimated Total</div>
                    <div className="text-lg font-bold text-gray-900 flex items-center gap-1">
                      <img src="/dirham.svg" alt="AED" className="w-5 h-5" />
                      {calculateTotal().toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {guestCount} {guestCount === 1 ? 'guest' : 'guests'}
                    </div>
                  </div>
                )}
              </aside>
            </div>

            {/* Footer with Total and Add to Cart - Only show for Set Menus */}
            {activeTab === 'setMenus' && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                      <img src="/dirham.svg" alt="AED" className="w-6 h-6" />
                      {calculateTotal().toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">{guestCount} guests</p>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedPackage || addingToCart || !eventType || !location || !eventDate}
                    className={`px-8 py-3 rounded-full font-semibold transition ${!selectedPackage || addingToCart || !eventType || !location || !eventDate
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-[#268700] text-white hover:bg-[#1f6b00]'
                      }`}
                  >
                    {addingToCart ? 'Proceeding...' : 'Continue to Package'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'buildYourOwn' && (
          <div className="pb-32">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Build Your Own Menu</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Number of Guests:</label>
                <input
                  type="number"
                  min="1"
                  value={guestCount}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value > 0) {
                      setGuestCount(value);
                    }
                  }}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-[#268700] focus:border-transparent"
                  placeholder="50"
                />
              </div>
            </div>

            {/* Dietary Filters */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setDietaryFilter(dietaryFilter === 'veg' ? null : 'veg')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${dietaryFilter === 'veg'
                  ? 'bg-[#268700] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Veg
              </button>
              <button
                onClick={() => setDietaryFilter(dietaryFilter === 'glutenFree' ? null : 'glutenFree')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${dietaryFilter === 'glutenFree'
                  ? 'bg-[#268700] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Gluten Free
              </button>
              <button
                onClick={() => setDietaryFilter(dietaryFilter === 'nonVeg' ? null : 'nonVeg')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${dietaryFilter === 'nonVeg'
                  ? 'bg-[#268700] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Non Veg
              </button>
              <button
                onClick={() => setDietaryFilter(dietaryFilter === 'sugarFree' ? null : 'sugarFree')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${dietaryFilter === 'sugarFree'
                  ? 'bg-[#268700] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Sugar Free
              </button>
            </div>

            {/* Menu Items Section */}
            <div className="bg-green-100 text-gray-800 p-4 rounded-lg mb-4 border border-green-200">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Menu Items (Customisable)</h3>
              <p className="text-sm text-gray-700">
                {caterer.description || 'Award-winning catering service specializing in Mediterranean and French cuisine. We bring restaurant-quality food to your events with impeccable service.'}
              </p>
            </div>

            {/* Loading State */}
            {loadingDishes ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#268700] mx-auto mb-4"></div>
                <p className="text-gray-500">Loading dishes...</p>
              </div>
            ) : dishes.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No dishes available for this caterer.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupDishesByCategory().map((categoryGroup) => {
                  const selectedInCategory = Array.from(selectedDishes).filter(id => {
                    const dish = dishes.find(d => d.id === id);
                    return dish?.category?.name === categoryGroup.categoryName;
                  }).length;

                  return (
                    <div key={categoryGroup.categoryName} className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-lg text-gray-900 mb-4">
                        {categoryGroup.categoryName}
                        {selectedInCategory > 0 && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({selectedInCategory} selected)
                          </span>
                        )}
                      </h4>
                      <div className="space-y-2">
                        {categoryGroup.dishes.map((dish) => {
                          const isSelected = isDishSelected(dish.id);

                          return (
                            <div
                              key={dish.id}
                              className={`flex items-center justify-between p-3 rounded-lg border transition cursor-pointer ${isSelected
                                ? 'border-[#268700] bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                              onClick={() => toggleDishSelection(dish.id, categoryGroup)}
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{dish.name}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  {dish.cuisine_type?.name || 'Cuisine'} • <img src="/dirham.svg" alt="AED" className="w-3 h-3" />{Number(dish.price).toLocaleString()}/person
                                </p>
                              </div>
                              <div className="ml-4">
                                {isSelected ? (
                                  <Check className="w-5 h-5 text-[#268700]" />
                                ) : (
                                  <Plus className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer with Total and Create Package */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    AED {calculateTotal().toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{guestCount} guests</p>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={selectedDishes.size === 0 || addingToCart}
                  className={`px-8 py-3 rounded-full font-semibold transition ${selectedDishes.size === 0 || addingToCart
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-[#268700] text-white hover:bg-[#1f6b00]'
                    }`}
                >
                  {addingToCart ? 'Creating...' : 'Create Package'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customiseMenu' && (
          <div className="pb-10">
            {/* Request a Custom Proposal Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Request a Custom Proposal</h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Number of Guests:</label>
                  <input
                    type="number"
                    min="1"
                    value={proposalGuestCount}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value > 0) {
                        setProposalGuestCount(value);
                      }
                    }}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-[#268700] focus:border-transparent"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type
                  </label>
                  <input
                    type="text"
                    value={proposalEventType}
                    onChange={(e) => setProposalEventType(e.target.value)}
                    placeholder="e.g., Wedding, Corporate Event, Birthday"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#268700]"
                  />
                </div>

                {/* Budget per Person */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget per Person
                  </label>
                  <input
                    type="text"
                    value={budgetPerPerson}
                    onChange={(e) => setBudgetPerPerson(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#268700] pl-10"
                  />
                  <img src="/dirham.svg" alt="AED" className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>

                {/* Event Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={proposalEventDate}
                      onChange={(e) => setProposalEventDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#268700]"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={proposalLocation}
                    onChange={(e) => setProposalLocation(e.target.value)}
                    placeholder="Enter event location"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#268700]"
                  />
                </div>
              </div>

              {/* Dietary Preferences */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Dietary Preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Veg', 'Non Veg', 'Gluten Free', 'Sugar Free', 'Vegan', 'Halal', 'Kosher'].map((pref) => {
                    const isSelected = selectedDietaryPreferences.has(pref);
                    return (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => {
                          const newSet = new Set(selectedDietaryPreferences);
                          if (isSelected) {
                            newSet.delete(pref);
                          } else {
                            newSet.add(pref);
                          }
                          setSelectedDietaryPreferences(newSet);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${isSelected
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {pref}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tell us about your vision */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about your vision
                </label>
                <textarea
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  placeholder="Describe your event, special requirements, theme, or any other details..."
                  rows={4}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#268700] resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={async () => {
                    if (!catererId) {
                      alert('Caterer ID is missing. Please try again.');
                      return;
                    }

                    setSubmittingProposal(true);
                    try {
                      const response = await userApi.createProposal({
                        caterer_id: catererId,
                        event_type: proposalEventType || undefined,
                        location: proposalLocation || undefined,
                        dietary_preferences: Array.from(selectedDietaryPreferences),
                        budget_per_person: budgetPerPerson || undefined,
                        event_date: proposalEventDate || undefined,
                        vision: vision || undefined,
                        guest_count: proposalGuestCount,
                      });

                      if (response.error) {
                        alert(response.error);
                      } else if (response.data?.success) {
                        // Reset form
                        setProposalEventType('');
                        setProposalLocation('12/345 Business Bay');
                        setSelectedDietaryPreferences(new Set(['Gluten Free', 'Sugar Free']));
                        setBudgetPerPerson('AED 12');
                        setProposalEventDate('2024-12-12');
                        setVision('');
                        setProposalGuestCount(50);
                        // Show success modal
                        setShowProposalSuccessModal(true);
                      } else {
                        alert('Failed to submit proposal. Please try again.');
                      }
                    } catch (err: any) {
                      console.error('Error submitting proposal:', err);
                      alert(err?.message || 'Failed to submit proposal. Please try again.');
                    } finally {
                      setSubmittingProposal(false);
                    }
                  }}
                  disabled={submittingProposal || !catererId}
                  className={`px-8 py-3 rounded-full font-semibold transition ${submittingProposal || !catererId
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-[#268700] text-white hover:bg-[#1f6b00]'
                    }`}
                >
                  {submittingProposal ? 'Submitting...' : 'Request a Quote'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Proposal Success Modal */}
      {
        showProposalSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blurred Background */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-md"
              onClick={() => setShowProposalSuccessModal(false)}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
              {/* Close Button */}
              <button
                onClick={() => setShowProposalSuccessModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>

              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-12 h-12 text-[#268700]" strokeWidth={3} />
                </div>
              </div>

              {/* Success Message */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Proposal Submitted!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your proposal request has been submitted successfully. We will get back to you soon with a customized quote.
                </p>

                {/* Action Button */}
                <button
                  onClick={() => setShowProposalSuccessModal(false)}
                  className="w-full bg-[#268700] text-white py-3 px-6 rounded-full font-semibold hover:bg-[#1f6b00] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }
    </section >
  );
}
