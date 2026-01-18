'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { userApi, type Caterer, type Package } from '@/lib/api/user.api';
import { Star, MapPin, Users, ChefHat, ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Toast, useToast } from '@/components/ui/Toast';
import { getLogoText } from '@/lib/constants';

type TabType = 'packages' | 'buildOwn' | 'requestQuote';

interface Occasion {
  id: string;
  name: string;
}

export default function CatererDetailPage() {
  const { catererId } = useParams<{ catererId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  // Data states
  const [caterer, setCaterer] = useState<Caterer | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI states
  const [activeTab, setActiveTab] = useState<TabType>('packages');
  const [guestCount, setGuestCount] = useState(50);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedCustomizablePackage, setSelectedCustomizablePackage] = useState<Package | null>(null);
  
  // Dish selection for customizable packages
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set());
  const [dietaryFilters, setDietaryFilters] = useState<Set<string>>(new Set());
  const [allCatererDishes, setAllCatererDishes] = useState<any[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(false);

  // Quote request states
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [quoteVision, setQuoteVision] = useState('');
  const [quoteBudget, setQuoteBudget] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<Set<string>>(new Set());
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Cart states
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartPackageIds, setCartPackageIds] = useState<Set<string>>(new Set());

  // Fetch initial data
  useEffect(() => {
    if (!catererId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [catererRes, packagesRes, occasionsRes] = await Promise.all([
          userApi.getCatererById(catererId),
          userApi.getPackagesByCatererId(catererId),
          userApi.getOccasions(),
        ]);

        if (catererRes.error) {
          setError(catererRes.error);
          return;
        }

        if (catererRes.data?.data) {
          setCaterer(catererRes.data.data);
          // Set initial guest count based on caterer's minimum
          if (catererRes.data.data.minimum_guests) {
            setGuestCount(catererRes.data.data.minimum_guests);
          }
        }

        if (packagesRes.data?.data) {
          setPackages(packagesRes.data.data);
          // Set initial selected packages
          const fixedPackages = packagesRes.data.data.filter(
            (pkg: Package) => pkg.customisation_type === 'FIXED'
          );
          const customizablePackages = packagesRes.data.data.filter(
            (pkg: Package) => pkg.customisation_type === 'CUSTOMISABLE' || pkg.customisation_type === 'CUSTOMIZABLE'
          );
          
          if (fixedPackages.length > 0) {
            setSelectedPackage(fixedPackages[0]);
          }
          if (customizablePackages.length > 0) {
            setSelectedCustomizablePackage(customizablePackages[0]);
          }
        }

        if (occasionsRes.data?.data) {
          setOccasions(occasionsRes.data.data);
        }
      } catch (err) {
        setError('Failed to load caterer details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [catererId]);

  // Check which packages are in cart
  useEffect(() => {
    const checkCart = async () => {
      try {
        if (user) {
          const res = await userApi.getCartItems();
          if (res.data?.data) {
            const ids = new Set(res.data.data.map((item: any) => item.package?.id).filter(Boolean));
            setCartPackageIds(ids as Set<string>);
          }
        } else {
          const { cartStorage } = await import('@/lib/utils/cartStorage');
          const localItems = cartStorage.getItems();
          const ids = new Set(localItems.map(item => item.package_id));
          setCartPackageIds(ids);
        }
      } catch (err) {
        console.error('Error checking cart:', err);
      }
    };

    checkCart();
  }, [user]);

  // Filter packages by type
  const fixedPackages = useMemo(() => {
    return packages.filter((pkg) => pkg.customisation_type === 'FIXED');
  }, [packages]);

  const customizablePackages = useMemo(() => {
    return packages.filter(
      (pkg) => pkg.customisation_type === 'CUSTOMISABLE' || pkg.customisation_type === 'CUSTOMIZABLE'
    );
  }, [packages]);

  // Reset selected dishes when customizable package changes
  useEffect(() => {
    if (selectedCustomizablePackage) {
      setSelectedDishes(new Set());
      setAllCatererDishes([]);
      
      // If package has category_selections but no items, fetch full package details
      const hasCategorySelections = selectedCustomizablePackage.category_selections && 
        selectedCustomizablePackage.category_selections.length > 0;
      const hasItems = selectedCustomizablePackage.items && 
        Array.isArray(selectedCustomizablePackage.items) && 
        selectedCustomizablePackage.items.length > 0;
      
      if (hasCategorySelections && !hasItems) {
        // Fetch full package details to ensure we have items
        const fetchPackageDetails = async () => {
          try {
            const res = await userApi.getPackageById(selectedCustomizablePackage.id);
            if (res.data?.data) {
              const updatedPackage = res.data.data;
              // Update the package in the packages array
              setPackages((prev) =>
                prev.map((pkg) =>
                  pkg.id === selectedCustomizablePackage.id ? updatedPackage : pkg
                )
              );
              // Update selected package with fresh data
              setSelectedCustomizablePackage(updatedPackage);
            }
          } catch (err) {
            console.error('Error fetching package details:', err);
            showToast('error', 'Failed to load package details');
          }
        };
        fetchPackageDetails();
      }
    }
  }, [selectedCustomizablePackage?.id]);

  // Fetch all caterer dishes when customizable package without category_selections is selected
  useEffect(() => {
    const fetchAllDishes = async () => {
      if (!selectedCustomizablePackage || !catererId) return;
      
      // Only fetch all dishes if package has no category_selections
      // (packages with category_selections use dishes from package.items)
      const hasCategorySelections = selectedCustomizablePackage.category_selections && 
        selectedCustomizablePackage.category_selections.length > 0;
      
      if (!hasCategorySelections) {
        setLoadingDishes(true);
        try {
          const res = await userApi.getDishesByCatererId(catererId);
          if (res.data?.data) {
            setAllCatererDishes(res.data.data);
          }
        } catch (err) {
          console.error('Error fetching caterer dishes:', err);
          showToast('error', 'Failed to load dishes');
        } finally {
          setLoadingDishes(false);
        }
      } else {
        setAllCatererDishes([]);
      }
    };

    fetchAllDishes();
  }, [selectedCustomizablePackage?.id, catererId]);

  // Group dishes by category for customizable packages
  const groupedDishesByCategory = useMemo(() => {
    if (!selectedCustomizablePackage) return {};
    
    const hasCategorySelections = selectedCustomizablePackage.category_selections && 
      selectedCustomizablePackage.category_selections.length > 0;
    
    // If package has category_selections, use dishes from package.items
    // Otherwise, use all caterer dishes
    let dishesToGroup: any[] = [];
    
    if (hasCategorySelections) {
      // Use package items - these are the dishes selected by the caterer
      if (selectedCustomizablePackage.items && Array.isArray(selectedCustomizablePackage.items) && selectedCustomizablePackage.items.length > 0) {
        dishesToGroup = selectedCustomizablePackage.items
          .filter((item: any) => item.dish && item.dish.id) // Only include items with valid dishes
          .map((item: any) => {
            // API returns category as string (category name) or null
            // Convert to object format for consistency
            const categoryName = item.dish?.category || 'Other';
            
            return {
              id: item.id, // PackageItem ID
              dish: {
                id: item.dish?.id,
                name: item.dish?.name,
                image_url: item.dish?.image_url,
                price: item.dish?.price,
                currency: item.dish?.currency,
                category: item.dish?.category 
                  ? (typeof item.dish.category === 'string' 
                      ? { name: item.dish.category }
                      : item.dish.category)
                  : null,
              },
              quantity: item.quantity || 1,
              price_at_time: item.price_at_time || item.dish?.price,
            };
          });
      } else {
        // Package has category_selections but no items - this shouldn't happen but handle gracefully
        console.warn('Package has category_selections but no items:', selectedCustomizablePackage.id);
      }
    } else {
      // Use all caterer dishes - convert to same format as package items
      dishesToGroup = allCatererDishes
        .filter((dish: any) => dish.is_active !== false) // Only active dishes
        .map((dish: any) => ({
          id: dish.id, // Use dish ID as item ID
          dish: {
            id: dish.id,
            name: dish.name,
            image_url: dish.image_url,
            price: dish.price,
            currency: dish.currency,
            category: dish.category ? { 
              id: dish.category.id,
              name: dish.category.name || (typeof dish.category === 'string' ? dish.category : 'Other')
            } : null,
            cuisine_type: dish.cuisine_type,
          },
          quantity: 1,
          price_at_time: dish.price,
        }));
    }
    
    const grouped: { [key: string]: any[] } = {};
    dishesToGroup.forEach((item: any) => {
      // Extract category name - API returns category as string (name) or null
      // Handle both object and string formats for robustness
      let categoryName = 'Other';
      if (item.dish?.category) {
        if (typeof item.dish.category === 'string') {
          categoryName = item.dish.category;
        } else if (item.dish.category && typeof item.dish.category === 'object' && item.dish.category.name) {
          categoryName = item.dish.category.name;
        }
      }
      
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(item);
    });
    return grouped;
  }, [selectedCustomizablePackage, allCatererDishes]);

  // Get category limits for customizable packages
  const categoryLimits = useMemo(() => {
    if (!selectedCustomizablePackage?.category_selections) return {};
    
    const limits: Record<string, number | null> = {};
    selectedCustomizablePackage.category_selections.forEach((selection: any) => {
      const categoryName = selection.category?.name || '';
      limits[categoryName] = selection.num_dishes_to_select;
    });
    return limits;
  }, [selectedCustomizablePackage]);

  // Get selected count per category
  const getSelectedCountForCategory = (categoryName: string): number => {
    if (!selectedCustomizablePackage) return 0;
    const items = groupedDishesByCategory[categoryName] || [];
    return items.filter((item) => selectedDishes.has(item.dish?.id)).length;
  };

  // Check if user can select more dishes in a category
  const canSelectMoreInCategory = (categoryName: string): boolean => {
    if (!selectedCustomizablePackage) return false;
    
    // If no category selections are defined, allow unlimited selection
    if (!selectedCustomizablePackage.category_selections || selectedCustomizablePackage.category_selections.length === 0) {
      return true;
    }
    
    const limit = categoryLimits[categoryName];
    if (limit === undefined) return true; // Category not in selections - allow unlimited
    if (limit === null) return true; // No limit (select all)
    const selected = getSelectedCountForCategory(categoryName);
    return selected < limit;
  };

  // Toggle dish selection
  const toggleDish = (dishId: string, categoryName: string) => {
    const newSelected = new Set(selectedDishes);
    const isCurrentlySelected = newSelected.has(dishId);
    
    if (isCurrentlySelected) {
      newSelected.delete(dishId);
    } else {
      // Check if we can add more dishes in this category
      if (!canSelectMoreInCategory(categoryName)) {
        const limit = categoryLimits[categoryName];
        showToast('error', `You can only select ${limit === null ? 'all' : limit} dish(es) from ${categoryName}`);
      return;
    }
      newSelected.add(dishId);
    }
    setSelectedDishes(newSelected);
  };

  // Calculate price for a package based on guest count
  const calculatePrice = (pkg: Package) => {
    // If package has fixed/custom price (is_custom_price = true), use total_price as-is
    if (pkg.is_custom_price) {
      // Ensure we're using Number() to convert from Decimal/string
      return typeof pkg.total_price === 'number' ? pkg.total_price : Number(pkg.total_price || 0);
    }
    
    const isCustomizable = pkg.customisation_type === 'CUSTOMISABLE' || pkg.customisation_type === 'CUSTOMIZABLE';
    const hasCategorySelections = pkg.category_selections && pkg.category_selections.length > 0;
    
    // For customizable packages, calculate from selected dishes
    if (isCustomizable && selectedDishes.size > 0) {
      let selectedTotal = 0;
      
      // Get all available dishes (from package items or all caterer dishes)
      const allAvailableDishes = hasCategorySelections 
        ? (pkg.items || [])
        : allCatererDishes.map((dish: any) => ({
            dish: {
              id: dish.id,
              price: dish.price,
            },
            quantity: 1,
            price_at_time: dish.price,
          }));
      
      allAvailableDishes.forEach((item: any) => {
        const dishId = item.dish?.id;
        if (selectedDishes.has(dishId)) {
          const dishPrice = Number(item.price_at_time || item.dish?.price || 0);
          const quantity = item.quantity || 1;
          selectedTotal += dishPrice * quantity * guestCount;
        }
      });
      
      return Math.round(selectedTotal);
    }
    
    // For fixed packages or customizable without selections, scale price by guest count
    const peopleCount = pkg.people_count || pkg.minimum_people || 1;
    // Ensure we're using Number() to convert from Decimal/string
    const totalPrice = typeof pkg.total_price === 'number' ? pkg.total_price : Number(pkg.total_price || 0);
    // Always calculate price_per_person from total_price to ensure accuracy
    const pricePerPerson = peopleCount > 0 ? totalPrice / peopleCount : 0;
    return Math.round(pricePerPerson * guestCount);
  };

  // Calculate price per person for display
  const calculatePricePerPerson = (pkg: Package) => {
    // Always calculate from total_price to ensure accuracy
    const peopleCount = pkg.people_count || pkg.minimum_people || 1;
    // Ensure we're using Number() to convert from Decimal/string
    const totalPrice = typeof pkg.total_price === 'number' ? pkg.total_price : Number(pkg.total_price || 0);
    if (peopleCount === 0) return 0;
    return totalPrice / peopleCount;
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    const pkg = activeTab === 'packages' ? selectedPackage : selectedCustomizablePackage;
    if (!pkg) {
      showToast('error', 'Please select a package');
      return;
    }

    // Validate customizable package selections
    const isCustomizable = pkg.customisation_type === 'CUSTOMISABLE' || pkg.customisation_type === 'CUSTOMIZABLE';
    if (isCustomizable) {
      if (pkg.category_selections && pkg.category_selections.length > 0) {
        // Package has category limits - validate against them
        for (const selection of pkg.category_selections) {
          const categoryName = selection.category?.name || '';
          const limit = selection.num_dishes_to_select;
          const selectedCount = getSelectedCountForCategory(categoryName);
          const availableCount = groupedDishesByCategory[categoryName]?.length || 0;
          
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
      const totalPrice = calculatePrice(pkg);
      const peopleCount = pkg.people_count || pkg.minimum_people || 1;
      const pricePerPerson = pkg.price_per_person ?? (pkg.total_price / peopleCount);

      // For customizable packages with selected dishes, create a custom package first
      if (isCustomizable && selectedDishes.size > 0) {
        if (!user) {
          showToast('error', 'Please log in to create custom packages');
          router.push('/login');
          return;
        }

        // Get dish IDs from selected dishes
        const dishIds = Array.from(selectedDishes);
        
        // Create custom package
        const customPackageRes = await userApi.createCustomPackage({
          dish_ids: dishIds,
          people_count: guestCount,
        });

        if (customPackageRes.error) {
          showToast('error', customPackageRes.error);
          return;
        }

        if (customPackageRes.data?.data) {
          const customPackage = customPackageRes.data.data;
          
          // Add custom package to cart
          const cartRes = await userApi.createCartItem({
            package_id: customPackage.id,
            guests: guestCount,
            price_at_time: totalPrice,
          });

          if (cartRes.error) {
            showToast('error', cartRes.error);
            return;
          }

          if (cartRes.data?.success) {
            showToast('success', 'Custom package added to cart!');
            setCartPackageIds(prev => new Set([...prev, customPackage.id]));
            // Dispatch event to update cart count in navbar
            window.dispatchEvent(new Event('cartUpdated'));
          }
        }
      } else {
        // For fixed packages or customizable without selections, add original package
        if (user) {
          // Add to server cart for authenticated users
          const res = await userApi.createCartItem({
            package_id: pkg.id,
            guests: guestCount,
            price_at_time: totalPrice,
          });

          if (res.error) {
            showToast('error', res.error);
            return;
          }

          if (res.data?.success) {
            showToast('success', `${pkg.name} added to cart!`);
            setCartPackageIds(prev => new Set([...prev, pkg.id]));
            // Dispatch event to update cart count in navbar
            window.dispatchEvent(new Event('cartUpdated'));
          }
        } else {
          // Store in localStorage for non-authenticated users
          const { cartStorage } = await import('@/lib/utils/cartStorage');
          cartStorage.addItem({
            package_id: pkg.id,
            package: {
              id: pkg.id,
              name: pkg.name,
              people_count: peopleCount,
              total_price: pkg.total_price,
              price_per_person: pricePerPerson,
              currency: pkg.currency,
              cover_image_url: pkg.cover_image_url,
              caterer: {
                id: pkg.caterer?.id || catererId,
                business_name: (pkg.caterer as any)?.business_name || caterer?.business_name || null,
                name: pkg.caterer?.name || caterer?.name,
              },
            },
            guests: guestCount,
            price_at_time: totalPrice,
          });

          showToast('success', `${pkg.name} added to cart!`);
          setCartPackageIds(prev => new Set([...prev, pkg.id]));
          // Dispatch event to update cart count in navbar
          window.dispatchEvent(new Event('cartUpdated'));
        }
      }
    } catch (err) {
      showToast('error', 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle quote request
  const handleRequestQuote = async () => {
    if (!catererId) return;

    if (!user) {
      showToast('error', 'Please log in to request a quote');
      router.push('/login');
      return;
    }

    setSubmittingQuote(true);
    try {
      const res = await userApi.createProposal({
        caterer_id: catererId,
        event_type: eventType || undefined,
        location: location || undefined,
        dietary_preferences: Array.from(dietaryPreferences),
        budget_per_person: quoteBudget || undefined,
        event_date: eventDate || undefined,
        vision: quoteVision || undefined,
        guest_count: guestCount,
      });

      if (res.error) {
        showToast('error', res.error);
        return;
      }

      showToast('success', 'Quote request submitted successfully!');
      // Reset form
      setQuoteVision('');
      setQuoteBudget('');
      setDietaryPreferences(new Set());
    } catch (err) {
      showToast('error', 'Failed to submit quote request');
    } finally {
      setSubmittingQuote(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading caterer...</p>
        </div>
      </div>
    );
  }

  if (error || !caterer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || 'Caterer not found'}</p>
          <Link
            href="/caterers"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Caterers
          </Link>
        </div>
      </div>
    );
  }

  const logoText = getLogoText(caterer.name);

  return (
    <section className="bg-gray-50 min-h-screen pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/caterers" className="hover:text-green-600 transition">
            Caterers
          </Link>
          <span>/</span>
          <span className="text-gray-900">{caterer.name}</span>
        </nav>

        {/* Caterer Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Logo/Image */}
            <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              {caterer.image_url ? (
                <Image
                  src={caterer.image_url}
                  alt={caterer.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                  {logoText}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {caterer.name}
              </h1>

              {/* Cuisines */}
              <div className="flex flex-wrap gap-2 mb-3">
                {caterer.cuisines.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {packages[0]?.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-gray-900">
                      {Number(packages[0].rating).toFixed(1)}
                    </span>
                  </div>
                )}
                {caterer.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{caterer.location}</span>
                  </div>
                )}
                {(caterer.minimum_guests || caterer.maximum_guests) && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>
                      {caterer.minimum_guests && `${caterer.minimum_guests}`}
                      {caterer.minimum_guests && caterer.maximum_guests && ' - '}
                      {caterer.maximum_guests && `${caterer.maximum_guests}`} guests
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {caterer.description && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                  {caterer.description}
                </p>
              )}

              {/* Price Range */}
              <p className="font-semibold text-gray-900 mt-3">
                {caterer.priceRange}
              </p>

              {/* Service Types */}
              <div className="flex flex-wrap gap-2 mt-3">
                {caterer.delivery_only && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <ChefHat className="w-3 h-3" /> Delivery
                  </span>
                )}
                {caterer.delivery_plus_setup && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <ChefHat className="w-3 h-3" /> Setup
                  </span>
                )}
                {caterer.full_service && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <ChefHat className="w-3 h-3" /> Full Service
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Images */}
        {caterer.gallery_images && caterer.gallery_images.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {caterer.gallery_images.map((imageUrl, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
                  <Image
                    src={imageUrl}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-1 mb-6">
          <div className="flex gap-1">
            {[ 
              { id: 'packages', label: 'Set Menus' },
              { id: 'buildOwn', label: 'Build Your Own' },
              { id: 'requestQuote', label: 'Customized Menu' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition ${activeTab === tab.id
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guest Count Selector - Shown for packages and build your own tabs */}
        {(activeTab === 'packages' || activeTab === 'buildOwn') && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeTab === 'packages' ? 'Select Your Package' : 'Build Your Menu'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Choose a package and add it to your cart
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Number of guests:
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setGuestCount(Math.max(caterer.minimum_guests || 1, guestCount - 10))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => {
                      const value = Math.max(caterer.minimum_guests || 1, Number(e.target.value));
                      setGuestCount(value);
                    }}
                    className="w-20 text-center py-2 text-sm focus:outline-none"
                    min={caterer.minimum_guests || 1}
                    max={caterer.maximum_guests}
                  />
                  <button
                    onClick={() => setGuestCount(Math.min(caterer.maximum_guests || 9999, guestCount + 10))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'packages' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                {fixedPackages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No fixed menu packages available from this caterer.
                  </p>
                ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fixedPackages.map((pkg) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  const totalPrice = calculatePrice(pkg);
                  const pricePerPerson = calculatePricePerPerson(pkg);

                  // Get menu summary
                  const menuSummary: { [key: string]: string[] } = {};
                  if (pkg.items) {
                    pkg.items.forEach((item: any) => {
                      const categoryName = item.dish?.category?.name || 'Other';
                      if (!menuSummary[categoryName]) {
                        menuSummary[categoryName] = [];
                      }
                      menuSummary[categoryName].push(item.dish?.name || 'Unknown');
                    });
                  }

                  return (
                    <div
                        key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                      {/* Package Header */}
                      <div className="flex items-start justify-between mb-3 pr-8">
                        <div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            Fixed Package
                          </span>
                          <h3 className="font-semibold text-lg text-gray-900 mt-2">
                            {pkg.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {pkg.is_custom_price ? (
                              <>AED {Number(pkg.total_price).toLocaleString()}</>
                            ) : (
                              <>AED {pricePerPerson.toLocaleString()}</>
                            )}
                          </p>
                          {!pkg.is_custom_price && (
                            <p className="text-xs text-gray-500">per person</p>
                          )}
              </div>
            </div>

                      {/* Menu Items */}
                      {Object.keys(menuSummary).length > 0 && (
                        <div className="space-y-2 mb-4 text-sm text-gray-600">
                          {Object.entries(menuSummary).slice(0, 5).map(([category, items]) => (
                            <div key={category} className="flex items-start gap-2">
                              <span className="text-green-600">•</span>
                              <span>
                                <span className="font-medium text-gray-700">{category}:</span>{' '}
                                {items.slice(0, 3).join(', ')}
                                {items.length > 3 && ` +${items.length - 3} more`}
                              </span>
            </div>
                          ))}
                          {Object.keys(menuSummary).length > 5 && (
                            <p className="text-gray-400 text-xs italic pl-4">
                              +{Object.keys(menuSummary).length - 5} more categories
                            </p>
                          )}
                        </div>
                      )}

                      {/* Price Summary */}
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Total for {guestCount} guests:</span>
                          <span className="font-bold text-gray-900">AED {totalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'buildOwn' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                {customizablePackages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No customizable menu packages available from this caterer.
                  </p>
                ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customizablePackages.map((pkg) => {
                  const isSelected = selectedCustomizablePackage?.id === pkg.id;
                  const totalPrice = calculatePrice(pkg);
                  const pricePerPerson = calculatePricePerPerson(pkg);

                  // Get menu summary
                  const menuSummary: { [key: string]: string[] } = {};
                  if (pkg.items) {
                    pkg.items.forEach((item: any) => {
                      const categoryName = item.dish?.category?.name || 'Other';
                      if (!menuSummary[categoryName]) {
                        menuSummary[categoryName] = [];
                      }
                      menuSummary[categoryName].push(item.dish?.name || 'Unknown');
                    });
                  }

                  return (
                    <div
                        key={pkg.id}
                      onClick={() => setSelectedCustomizablePackage(pkg)}
                      className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {/* Package Header */}
                      <div className="flex items-start justify-between mb-3 pr-8">
                        <div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Customizable
                          </span>
                          <h3 className="font-semibold text-lg text-gray-900 mt-2">
                            {pkg.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {pkg.is_custom_price ? (
                              <>AED {Number(pkg.total_price).toLocaleString()}</>
                            ) : (
                              <>AED {pricePerPerson.toLocaleString()}</>
                            )}
                          </p>
                          {!pkg.is_custom_price && (
                            <p className="text-xs text-gray-500">per person</p>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {pkg.description && (
                        <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                      )}

                      {/* Menu Items */}
                      {Object.keys(menuSummary).length > 0 && (
                        <div className="space-y-2 mb-4 text-sm text-gray-600">
                          {Object.entries(menuSummary).slice(0, 5).map(([category, items]) => (
                            <div key={category} className="flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              <span>
                                <span className="font-medium text-gray-700">{category}:</span>{' '}
                                {items.slice(0, 3).join(', ')}
                                {items.length > 3 && ` +${items.length - 3} more`}
                              </span>
                            </div>
                          ))}
                          {Object.keys(menuSummary).length > 5 && (
                            <p className="text-gray-400 text-xs italic pl-4">
                              +{Object.keys(menuSummary).length - 5} more categories
                            </p>
                          )}
                  </div>
                )}

                      {/* Price Summary */}
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            {pkg.is_custom_price ? 'Total:' : `Total for ${guestCount} guests:`}
                          </span>
                          <span className="font-bold text-gray-900">AED {totalPrice.toLocaleString()}</span>
              </div>
            </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dish Selection Section - Shows when a customizable package is selected */}
            {selectedCustomizablePackage && (
              <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select Your Dishes
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedCustomizablePackage.category_selections && selectedCustomizablePackage.category_selections.length > 0
                      ? 'Choose dishes from each category according to the limits set by the caterer'
                      : 'Select any dishes you want from the menu below'}
                  </p>
            </div>

                {loadingDishes ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
                      <p className="text-gray-500 text-sm">Loading dishes...</p>
          </div>
                  </div>
                ) : Object.keys(groupedDishesByCategory).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-2">
                      {selectedCustomizablePackage.category_selections && selectedCustomizablePackage.category_selections.length > 0
                        ? 'No dishes available for this package. Please contact the caterer.'
                        : 'No dishes available for selection.'}
                    </p>
                    {selectedCustomizablePackage.items && selectedCustomizablePackage.items.length === 0 && (
                      <p className="text-gray-400 text-sm">
                        This package has no dishes configured.
                      </p>
                    )}
                  </div>
                ) : (
                  <>

                {/* Dietary Preferences Filters */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Dietary Preferences
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Gluten Free', 'Vegan', 'Sugar Free', 'Guilt Free', 'Dairy Free', 'Nuts Free'].map((pref) => {
                      const isSelected = dietaryFilters.has(pref);
                      return (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => {
                            const newFilters = new Set(dietaryFilters);
                            if (isSelected) {
                              newFilters.delete(pref);
                            } else {
                              newFilters.add(pref);
                            }
                            setDietaryFilters(newFilters);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                            isSelected
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {pref}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dishes by Category */}
                <div className="space-y-4">
                  {Object.entries(groupedDishesByCategory).map(([categoryName, items]) => {
                    const selectedCount = getSelectedCountForCategory(categoryName);
                    const limit = categoryLimits[categoryName];
                    const hasLimits = selectedCustomizablePackage.category_selections && selectedCustomizablePackage.category_selections.length > 0;
                    const canSelectMore = canSelectMoreInCategory(categoryName);

                    return (
                      <div key={categoryName} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Category Header */}
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{categoryName}</h4>
                              {hasLimits && limit !== undefined && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Select {limit === null ? 'any dishes' : `up to ${limit} dish${limit === 1 ? '' : 'es'}`} from this category
                                </p>
                              )}
                            </div>
                            <span className={`text-sm font-medium ${
                              selectedCount > 0 ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {hasLimits && limit !== undefined
                                ? `${selectedCount} / ${limit === null ? items.length : limit} selected`
                                : `${selectedCount} selected`}
                            </span>
                          </div>
                        </div>

                        {/* Dishes List */}
                        <div className="divide-y divide-gray-100">
                          {items.map((item: any) => {
                            const dishId = item.dish?.id;
                            const isSelected = selectedDishes.has(dishId);
                            const isDisabled = !isSelected && !canSelectMore;
                            const dishPrice = Number(item.price_at_time || item.dish?.price || 0);
                            const quantity = item.quantity || 1;

                            return (
                              <div
                                key={item.id || dishId}
                                onClick={() => !isDisabled && dishId && toggleDish(dishId, categoryName)}
                                className={`px-4 py-3 flex items-center justify-between ${
                                  !isDisabled ? 'cursor-pointer hover:bg-gray-50' : ''
                                } ${isSelected ? 'bg-green-50' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.dish?.name || 'Unknown'}
                                  </p>
                                  {quantity > 1 && (
                                    <p className="text-xs text-gray-500">Quantity: {quantity}</p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-1">
                                    AED {dishPrice.toLocaleString()} per person
                                  </p>
                                </div>
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'bg-green-600 border-green-600'
                                    : isDisabled
                                    ? 'border-gray-200 bg-gray-100'
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requestQuote' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Request a Custom Quote
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Tell us about your event and we'll create a personalized proposal for you.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Event Type</option>
                    {occasions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Guest Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Event Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget per Person (AED)
                  </label>
                  <input
                    type="text"
                    value={quoteBudget}
                    onChange={(e) => setQuoteBudget(e.target.value)}
                    placeholder="e.g., 150"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your event location"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Dietary Preferences */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Vegetarian', 'Vegan', 'Halal', 'Gluten Free', 'Sugar Free', 'Kosher'].map(
                    (pref) => {
                      const isSelected = dietaryPreferences.has(pref);
                      return (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => {
                            const newPrefs = new Set(dietaryPreferences);
                            if (isSelected) {
                              newPrefs.delete(pref);
                            } else {
                              newPrefs.add(pref);
                            }
                            setDietaryPreferences(newPrefs);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${isSelected
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                            }`}
                        >
                          {pref}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Vision */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about your vision
                </label>
                <textarea
                  value={quoteVision}
                  onChange={(e) => setQuoteVision(e.target.value)}
                  placeholder="Describe your event, theme, special requirements..."
                  rows={4}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <button
                onClick={handleRequestQuote}
                disabled={submittingQuote}
                className={`w-full py-3 rounded-lg font-medium transition ${submittingQuote
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                {submittingQuote ? 'Submitting...' : 'Submit Quote Request'}
              </button>
            </div>
          </div>
        )}

        {/* Fixed Bottom Bar - Add to Cart */}
        {((activeTab === 'packages' && selectedPackage) || (activeTab === 'buildOwn' && selectedCustomizablePackage)) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm text-gray-500">
                    {(() => {
                      const pkg = activeTab === 'packages' ? selectedPackage : selectedCustomizablePackage;
                      return pkg?.is_custom_price ? 'Total' : `Total for ${guestCount} guests`;
                    })()}
                  </p>
                <p className="text-2xl font-bold text-gray-900">
                    AED {(() => {
                      const pkg = activeTab === 'packages' ? selectedPackage : selectedCustomizablePackage;
                      return pkg ? calculatePrice(pkg).toLocaleString() : '0';
                    })()}
                </p>
              </div>
              <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                    addingToCart
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </>
                  )}
              </button>
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
