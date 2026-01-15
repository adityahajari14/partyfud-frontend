'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import React from 'react';
import { userApi, type Package } from '@/lib/api/user.api';
import { Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
// import { Testimonials } from '@/user/Testimonials';

export default function PackageDetailsPage() {
    const [eventType, setEventType] = useState('');
    const [location, setLocation] = useState('');
    const [guests, setGuests] = useState<number>(0);
    const [date, setDate] = useState('');
    const [pkg, setPkg] = useState<Package | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addingToCart, setAddingToCart] = useState(false);
    const [removingFromCart, setRemovingFromCart] = useState(false);
    const [cartMessage, setCartMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const [cartItemId, setCartItemId] = useState<string | null>(null);
    const [selectedDishIds, setSelectedDishIds] = useState<Set<string>>(new Set());
    const [creatingPackage, setCreatingPackage] = useState(false);
    const [packageMessage, setPackageMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const packageId = params.packageId as string;
    const catererId = params.catererId as string;

    // Read query params on mount
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const guestsParam = searchParams.get('guests');
        const eventTypeParam = searchParams.get('eventType');
        const locationParam = searchParams.get('location');
        const dateParam = searchParams.get('date');

        if (guestsParam) {
            setGuests(parseInt(guestsParam, 10));
        } else if (pkg?.people_count) {
            // Fallback to package's people_count if not provided
            setGuests(pkg.people_count);
        }
        if (eventTypeParam) {
            setEventType(eventTypeParam);
        } else if (pkg?.package_type?.id) {
            // Fallback to package's package_type_id if not provided in query params
            setEventType(pkg.package_type.id);
        }
        if (locationParam) {
            setLocation(locationParam);
        }
        if (dateParam) {
            setDate(dateParam);
        }
    }, [pkg]);


    // Fetch package details
    useEffect(() => {
        const fetchPackage = async () => {
            if (!packageId) return;

            setLoading(true);
            setError(null);

            try {
                const response = await userApi.getPackageById(packageId);

                if (response.error) {
                    setError(response.error);
                } else if (response.data?.data) {
                    const packageData = response.data.data;
                    
                    // Redirect user-created custom packages to My Packages page
                    if (packageData.created_by === 'USER') {
                        // This is a user-created package, redirect to My Packages
                        router.replace(`/user/mypackages/${packageId}`);
                        return;
                    }
                    
                    setPkg(packageData);
                    // Set default guests to the package's people_count
                    if (packageData.people_count) {
                        setGuests(packageData.people_count);
                    }
                }
            } catch (err) {
                setError('Failed to fetch package');
            } finally {
                setLoading(false);
            }
        };

        fetchPackage();
    }, [packageId, router]);

    // Check for pending cart item on mount/login
    useEffect(() => {
        const resumePendingAction = async () => {
            const pendingItemStr = sessionStorage.getItem('pending_cart_item');
            if (!pendingItemStr || !user || loading || !pkg) return;

            try {
                const pendingItem = JSON.parse(pendingItemStr);

                // Only resume if it's the correct package and recent (within 30 mins)
                if (pendingItem.packageId === packageId && (Date.now() - pendingItem.timestamp < 30 * 60 * 1000)) {
                    console.log('🔄 Resuming pending cart action...');

                    // Restore state
                    if (pendingItem.location) setLocation(pendingItem.location);
                    if (pendingItem.guests) setGuests(pendingItem.guests);
                    if (pendingItem.date) setDate(pendingItem.date);
                    if (pendingItem.selectedDishIds) setSelectedDishIds(new Set(pendingItem.selectedDishIds));

                    // Clear pending item immediately to prevent loops
                    sessionStorage.removeItem('pending_cart_item');

                    // Small delay to ensure state is updated before resuming action
                    setTimeout(() => {
                        if (pendingItem.action === 'create_custom_package') {
                            handleCreateCustomPackage();
                        } else {
                            handleAddToCart();
                        }
                    }, 500);
                } else {
                    // Item expired or wrong package
                    sessionStorage.removeItem('pending_cart_item');
                }
            } catch (err) {
                console.error('Error resuming pending cart action:', err);
                sessionStorage.removeItem('pending_cart_item');
            }
        };

        resumePendingAction();
    }, [user, loading, pkg, packageId]);

    // Check if package is already in cart
    useEffect(() => {
        const checkCartStatus = async () => {
            if (!packageId) return;

            // Don't check cart if not logged in
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setIsAddedToCart(false);
                setCartItemId(null);
                return;
            }

            try {
                const response = await userApi.getCartItems();

                if (response.data?.data && Array.isArray(response.data.data)) {
                    const cartItem = response.data.data.find(
                        (item: any) => item.package?.id === packageId
                    );

                    if (cartItem) {
                        setIsAddedToCart(true);
                        setCartItemId(cartItem.id);
                    } else {
                        setIsAddedToCart(false);
                        setCartItemId(null);
                    }
                }
            } catch (err) {
                console.error('Error checking cart status:', err);
            }
        };

        checkCartStatus();
    }, [packageId]);

    // Validate category selections meet limits
    const validateCategorySelections = (): { valid: boolean; message?: string } => {
        if (!pkg?.category_selections || pkg.category_selections.length === 0) {
            return { valid: true };
        }

        // Get categories that actually have items in the package
        const categoriesWithItems = new Set<string>();
        if (pkg.items) {
            pkg.items.forEach((item: any) => {
                const categoryName = item.dish?.category?.name || item.dish?.category;
                if (categoryName) {
                    categoriesWithItems.add(categoryName.trim().toLowerCase());
                }
            });
        }

        for (const selection of pkg.category_selections) {
            const categoryName = selection.category.name;
            const limit = selection.num_dishes_to_select;

            // Only validate categories that have items available in the package
            const categoryNameNormalized = categoryName.trim().toLowerCase();
            if (!categoriesWithItems.has(categoryNameNormalized)) {
                // Skip validation for categories that don't have items in the package
                continue;
            }

            const selectedCount = getSelectedCountInCategory(categoryName);

            if (limit !== null && limit !== undefined) {
                if (selectedCount < limit) {
                    return {
                        valid: false,
                        message: `Please select ${limit} ${limit === 1 ? 'item' : 'items'} from ${categoryName}. Currently selected: ${selectedCount}`
                    };
                }
            }
        }

        return { valid: true };
    };

    // Handle Add to Cart
    const handleAddToCart = async () => {
        // Check authentication first
        const token = localStorage.getItem('auth_token');
        if (!token) {
            // Save current selection state to resume after login
            const pendingItem = {
                packageId,
                catererId,
                location,
                guests,
                date,
                selectedDishIds: Array.from(selectedDishIds),
                timestamp: Date.now()
            };
            sessionStorage.setItem('pending_cart_item', JSON.stringify(pendingItem));

            setCartMessage({ type: 'success', text: 'Redirecting to login...' });
            setTimeout(() => {
                router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            }, 1000);
            return;
        }

        if (!pkg) {
            setCartMessage({ type: 'error', text: 'Package information not available' });
            return;
        }

        // Validate required fields - package_type_id comes from the package itself
        if (!pkg.package_type?.id) {
            setCartMessage({ type: 'error', text: 'Package type information is missing. Please try again.' });
            return;
        }

        if (!location) {
            setCartMessage({ type: 'error', text: 'Please select a location' });
            return;
        }

        if (!guests || guests <= 0) {
            setCartMessage({ type: 'error', text: 'Please select number of guests' });
            return;
        }

        if (!date) {
            setCartMessage({ type: 'error', text: 'Please select a date' });
            return;
        }

        // Validate category selections only for FIXED packages with category limits
        if (pkg.customisation_type === 'FIXED' && pkg.category_selections && pkg.category_selections.length > 0) {
            const validation = validateCategorySelections();
            if (!validation.valid) {
                setCartMessage({ type: 'error', text: validation.message || 'Please complete all category selections' });
                return;
            }
        }

        setAddingToCart(true);
        setCartMessage(null);

        try {
            // Format date to ISO string with default time (18:00 local time)
            // Date input gives YYYY-MM-DD, we'll set it to 18:00:00 local time
            const dateObj = new Date(date);
            dateObj.setHours(18, 0, 0, 0); // Set to 6 PM local time
            const isoDate = dateObj.toISOString();

            // Calculate price based on guests (scale from package price)
            // If guests = people_count, use original price
            // If guests = 2x people_count, use 2x price, etc.
            const priceMultiplier = guests / pkg.people_count;
            const calculatedPrice = pkg.total_price * priceMultiplier;

            // Use package's package_type_id (not eventType which is an occasion ID)
            const packageTypeId = pkg.package_type?.id;
            if (!packageTypeId) {
                setCartMessage({ type: 'error', text: 'Package type information is missing. Please try again.' });
                setAddingToCart(false);
                return;
            }

            const cartData = {
                package_id: pkg.id,
                package_type_id: packageTypeId,
                location: location,
                guests: guests,
                date: isoDate,
                price_at_time: calculatedPrice,
            };

            const response = await userApi.createCartItem(cartData);

            if (response.error) {
                // Handle specific error cases with user-friendly messages
                let errorMessage = response.error;

                if (errorMessage.includes('authentication') || errorMessage.includes('Unauthorized') || errorMessage.includes('User account not found')) {
                    errorMessage = 'Your session has expired. Please log in again.';
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                } else if (errorMessage.includes('Foreign key') || errorMessage.includes('constraint')) {
                    errorMessage = 'Unable to add to cart. Please try logging in again.';
                } else if (errorMessage.includes('already exists')) {
                    errorMessage = 'This package is already in your cart.';
                } else if (errorMessage.includes('Package type not found') || errorMessage.includes('package type') || errorMessage.includes('package_type')) {
                    errorMessage = 'Please select a valid event type. Please go back and select an event type.';
                }

                setCartMessage({ type: 'error', text: errorMessage });
                setIsAddedToCart(false);
            } else if (response.data?.success) {
                setCartMessage({ type: 'success', text: 'Item added to cart successfully!' });
                setIsAddedToCart(true);
                // Store cart item ID if available in response
                if (response.data?.data?.id) {
                    setCartItemId(response.data.data.id);
                }
                // Clear message after 3 seconds
                setTimeout(() => {
                    setCartMessage(null);
                }, 3000);
            } else {
                setCartMessage({ type: 'error', text: 'Failed to add item to cart' });
                setIsAddedToCart(false);
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            setCartMessage({ type: 'error', text: 'An error occurred while adding to cart' });
            setIsAddedToCart(false);
        } finally {
            setAddingToCart(false);
        }
    };

    // Handle Remove from Cart
    const handleRemoveFromCart = async () => {
        if (!cartItemId) {
            setCartMessage({ type: 'error', text: 'Cart item ID not found' });
            return;
        }

        if (!confirm('Are you sure you want to remove this item from your cart?')) {
            return;
        }

        setRemovingFromCart(true);
        setCartMessage(null);

        try {
            const response = await userApi.deleteCartItem(cartItemId);

            if (response.error) {
                setCartMessage({ type: 'error', text: response.error });
            } else {
                setCartMessage({ type: 'success', text: 'Item removed from cart successfully!' });
                setIsAddedToCart(false);
                setCartItemId(null);
                // Clear message after 3 seconds
                setTimeout(() => {
                    setCartMessage(null);
                }, 3000);
            }
        } catch (err) {
            console.error('Error removing from cart:', err);
            setCartMessage({ type: 'error', text: 'An error occurred while removing from cart' });
        } finally {
            setRemovingFromCart(false);
        }
    };

    // Reset added to cart state when form fields change (only if not already in cart)
    useEffect(() => {
        // Only reset if the item was just added, not if it was already in cart
        if (isAddedToCart && !cartItemId) {
            setIsAddedToCart(false);
        }
    }, [eventType, location, guests, date]);

    // Check if package is customizable (CUSTOMISABLE type allows unlimited selections)
    const isCustomizable = pkg?.customisation_type === 'CUSTOMISABLE' ||
        pkg?.customisation_type === 'CUSTOMIZABLE';

    // Check if package is FIXED with category selections (has limits)
    const isFixedWithLimits = pkg?.customisation_type === 'FIXED' &&
        pkg?.category_selections &&
        pkg.category_selections.length > 0;

    // Get category selection limit for a category (only for FIXED packages)
    const getCategoryLimit = (categoryName: string): number | null => {
        // Only apply limits for FIXED packages
        if (!isFixedWithLimits || !pkg?.category_selections) return null;
        const selection = pkg.category_selections.find(
            (cs: any) => {
                const selectionCategoryName = cs.category?.name || '';
                // Normalize category names for comparison (trim and case-insensitive)
                return selectionCategoryName.trim().toLowerCase() === categoryName.trim().toLowerCase();
            }
        );
        return selection?.num_dishes_to_select ?? null;
    };

    // Get selected count for a category
    const getSelectedCountInCategory = (categoryName: string): number => {
        if (!pkg) return 0;
        return Array.from(selectedDishIds).filter(id => {
            const item = pkg.items.find((item: any) => item.dish?.id === id);
            const itemCategoryName = item?.dish?.category?.name || item?.dish?.category;
            // Normalize category names for comparison (trim and case-insensitive)
            return itemCategoryName?.trim().toLowerCase() === categoryName.trim().toLowerCase();
        }).length;
    };

    // Check if can select more in category
    const canSelectInCategory = (categoryName: string): boolean => {
        // For CUSTOMISABLE packages, always allow selection (no limits)
        if (isCustomizable) return true;

        // For FIXED packages, check limits
        const limit = getCategoryLimit(categoryName);
        if (limit === null) return true; // No limit (select all)
        const selectedCount = getSelectedCountInCategory(categoryName);
        // Must be strictly less than limit to allow selection
        return selectedCount < limit;
    };

    // Toggle dish selection with category limits
    const toggleDishSelection = (dishId: string, categoryName: string) => {
        // Allow selection for CUSTOMISABLE packages or FIXED packages with category selections
        if ((!isCustomizable && !isFixedWithLimits) || !pkg) return;

        const newSelected = new Set(selectedDishIds);
        const isCurrentlySelected = newSelected.has(dishId);

        if (isCurrentlySelected) {
            // Deselecting - always allowed
            newSelected.delete(dishId);
        } else {
            // For CUSTOMISABLE packages, no limits - allow unlimited selection
            if (isCustomizable) {
                newSelected.add(dishId);
            } else {
                // For FIXED packages, check category limit BEFORE adding
                const limit = getCategoryLimit(categoryName);

                if (limit !== null) {
                    // Calculate current count in this category (excluding the item we're about to add)
                    const currentCount = getSelectedCountInCategory(categoryName);

                    // Check if adding this item would exceed the limit
                    if (currentCount >= limit) {
                        // Limit reached - show message and prevent selection
                        setCartMessage({
                            type: 'error',
                            text: `You can only select ${limit} ${limit === 1 ? 'item' : 'items'} from ${categoryName}. Please deselect another item first.`
                        });
                        setTimeout(() => setCartMessage(null), 3000);
                        return; // Don't add the item
                    }
                }

                // Limit check passed (or no limit) - add the item
                newSelected.add(dishId);
            }
        }

        setSelectedDishIds(newSelected);
    };

    // Check if dish is selected
    const isDishSelected = (dishId: string) => {
        return selectedDishIds.has(dishId);
    };

    // Handle Create Custom Package
    const handleCreateCustomPackage = async () => {
        if (!pkg || selectedDishIds.size === 0) {
            setPackageMessage({ type: 'error', text: 'Please select at least one dish' });
            return;
        }

        if (!user) {
            // Save current selection state to resume after login
            const pendingItem = {
                packageId,
                catererId,
                location,
                guests,
                date,
                selectedDishIds: Array.from(selectedDishIds),
                action: 'create_custom_package',
                timestamp: Date.now()
            };
            sessionStorage.setItem('pending_cart_item', JSON.stringify(pendingItem));

            setPackageMessage({ type: 'success', text: 'Redirecting to login...' });
            setTimeout(() => {
                router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            }, 1000);
            return;
        }

        if (!guests || guests <= 0) {
            setPackageMessage({ type: 'error', text: 'Please select number of guests' });
            return;
        }

        setCreatingPackage(true);
        setPackageMessage(null);

        try {
            // Convert selected dishes Set to array and filter out any invalid IDs
            const dishIds = Array.from(selectedDishIds).filter(id => id && id.trim() !== '');

            if (dishIds.length === 0) {
                setPackageMessage({ type: 'error', text: 'Please select at least one valid dish' });
                setCreatingPackage(false);
                return;
            }

            // Validate that all selected dishes belong to dishes in the package
            const packageDishIds = new Set(pkg.items.map((item: any) => item.dish?.id).filter(Boolean));
            const invalidDishes = dishIds.filter(id => !packageDishIds.has(id));

            if (invalidDishes.length > 0) {
                setPackageMessage({ type: 'error', text: 'Some selected dishes are not valid. Please refresh the page and try again.' });
                setCreatingPackage(false);
                return;
            }

            // Create custom package
            const response = await userApi.createCustomPackage({
                dish_ids: dishIds,
                people_count: guests,
                package_type_id: eventType || pkg.package_type?.id,
            });

            if (response.error) {
                if (response.status === 401 || response.error.includes('Unauthorized') || response.error.includes('401')) {
                    setPackageMessage({ type: 'error', text: 'Your session has expired. Please log in again.' });
                    setTimeout(() => router.push('/login'), 2000);
                    return;
                }
                // Show the actual error message from backend
                const errorMessage = response.error.includes('All dishes must be from the same caterer')
                    ? 'All selected dishes must be from the same caterer. Please ensure all dishes belong to this package\'s caterer.'
                    : response.error || 'Failed to create custom package';
                setPackageMessage({ type: 'error', text: errorMessage });
            } else if (response.data?.success || response.data?.data) {
                const newPackageId = response.data?.data?.id;
                setPackageMessage({ type: 'success', text: 'Package created successfully! Redirecting to package details...' });
                // Redirect to the created package details page after 1.5 seconds
                if (newPackageId) {
                    setTimeout(() => {
                        router.push(`/user/mypackages/${newPackageId}`);
                    }, 1500);
                } else {
                    // Fallback to my packages list if ID is not available
                    setTimeout(() => {
                        router.push('/user/mypackages');
                    }, 1500);
                }
            } else {
                setPackageMessage({ type: 'error', text: 'Failed to create custom package' });
            }
        } catch (err: any) {
            console.error('Error creating custom package:', err);
            if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
                setPackageMessage({ type: 'error', text: 'Your session has expired. Please log in again.' });
                setTimeout(() => router.push('/login'), 2000);
            } else {
                setPackageMessage({ type: 'error', text: err?.message || 'Failed to create custom package' });
            }
        } finally {
            setCreatingPackage(false);
        }
    };

    // Reset selected dishes when package changes
    useEffect(() => {
        setSelectedDishIds(new Set());
    }, [packageId]);

    // Initialize selected dishes with all items if customizable (optional - you can start with empty selection)
    useEffect(() => {
        if (pkg && isCustomizable && selectedDishIds.size === 0) {
            // Optionally pre-select all dishes, or leave empty for user to select
            // Uncomment the next lines if you want all dishes pre-selected:
            // const allDishIds = new Set(pkg.items.map((item: any) => item.dish?.id).filter(Boolean));
            // setSelectedDishIds(allDishIds);
        }
    }, [pkg, isCustomizable]);

    // Group items by category for display
    const groupedItems = pkg ? pkg.items.reduce((acc: any, item) => {
        const categoryName = item.dish?.category?.name || item.dish?.category || 'Uncategorized';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(item);
        return acc;
    }, {}) : {};

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Loading...
            </div>
        );
    }

    if (error || !pkg) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                {error || 'Package not found'}
            </div>
        );
    }

    // Create placeholder images array if cover_image_url exists
    const images = pkg.cover_image_url
        ? [pkg.cover_image_url, '/user/package2.svg', '/user/package3.svg', '/user/package4.svg']
        : ['/user/package1.svg', '/user/package2.svg', '/user/package3.svg', '/user/package4.svg'];

    return (
        <>
            <section className="bg-[#FAFAFA] min-h-screen px-6 py-10">
                <div className="max-w-7xl mx-auto">

                    {/* Back Button */}
                    <button
                        onClick={() => router.push(`/user/caterers/${catererId}`)}
                        className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Packages
                    </button>

                    {/* Package Header */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h1>
                        <p className="text-sm text-gray-500 mb-4">{pkg.package_type?.name || 'Package'}</p>
                        <div className="flex items-center gap-6">
                            {pkg.rating && (
                                <div className="text-sm">
                                    ⭐ {pkg.rating}
                                </div>
                            )}
                            <div className="font-semibold flex items-center gap-1">
                                <img src="/dirham.svg" alt="AED" className="w-4 h-4" />
                                {pkg.price_per_person.toLocaleString()}/Person
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                Total: <img src="/dirham.svg" alt="AED" className="w-3 h-3" />{pkg.total_price.toLocaleString()} for {pkg.people_count} people
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT */}
                    <div>
                        {/* Image Gallery */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="col-span-2 row-span-2 relative h-[260px] rounded-xl overflow-hidden">
                                <Image
                                    src={images[0] || '/default_dish.jpg'}
                                    alt={pkg.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {images.slice(1, 4).map((img, i) => (
                                <div
                                    key={i}
                                    className="relative h-[120px] rounded-xl overflow-hidden"
                                >
                                    <Image src={img || '/default_dish.jpg'} alt="" fill className="object-cover" />
                                    {i === 2 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-medium">
                                            View All ({pkg.items.length})
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Menu Items */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <h3 className="font-medium mb-2">
                                Menu Items {isCustomizable ? '(Customizable)' : isFixedWithLimits ? '(Fixed - Select Items)' : '(Fixed)'}
                            </h3>

                            <p className="text-sm text-gray-600 mb-4">
                                Package includes {pkg.items.length} items for {pkg.people_count} people.
                            </p>

                            {/* List grouped by category */}
                            <div className="space-y-0">
                                {Object.entries(groupedItems).map(([category, items]: [string, any], categoryIndex) => {
                                    const categoryLimit = getCategoryLimit(category);
                                    const selectedInCategory = getSelectedCountInCategory(category);
                                    const canSelectMore = canSelectInCategory(category);

                                    return (
                                        <div key={category} className="mb-0">
                                            {/* Category Header with light grey background */}
                                            <div className="bg-gray-100 py-2 px-4 font-semibold text-gray-900 flex items-center justify-between">
                                                <span>{category}</span>
                                                {/* Only show limits for FIXED packages with category selections */}
                                                {isFixedWithLimits && categoryLimit !== null && (
                                                    <span className="text-sm font-normal text-gray-600">
                                                        {selectedInCategory} / {categoryLimit} selected
                                                    </span>
                                                )}
                                                {/* Show selection count for CUSTOMISABLE packages (no limits) */}
                                                {isCustomizable && selectedInCategory > 0 && (
                                                    <span className="text-sm font-normal text-gray-600">
                                                        {selectedInCategory} selected
                                                    </span>
                                                )}
                                            </div>

                                            {/* Dishes List */}
                                            <div className="bg-white">
                                                {items.map((item: any, itemIndex: number) => {
                                                    // Only allow selection if dish has a valid ID
                                                    const dishId = item.dish?.id;
                                                    const hasValidDishId = dishId && dishId.trim() !== '';
                                                    const isSelected = hasValidDishId ? isDishSelected(dishId) : false;

                                                    // For CUSTOMISABLE packages: no limits, always allow selection
                                                    // For FIXED packages: check limits
                                                    const categoryLimit = getCategoryLimit(category);
                                                    const selectedInThisCategory = getSelectedCountInCategory(category);
                                                    const isAtLimit = isFixedWithLimits && categoryLimit !== null && selectedInThisCategory >= categoryLimit && !isSelected;
                                                    const isDisabled = isFixedWithLimits && hasValidDishId && !isSelected && !canSelectMore;

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (hasValidDishId && !isDisabled && !isAtLimit) {
                                                                    toggleDishSelection(dishId, category);
                                                                } else if (isAtLimit) {
                                                                    setCartMessage({
                                                                        type: 'error',
                                                                        text: `You can only select ${categoryLimit} ${categoryLimit === 1 ? 'item' : 'items'} from ${category}`
                                                                    });
                                                                    setTimeout(() => setCartMessage(null), 3000);
                                                                }
                                                            }}
                                                            className={`py-3 px-4 border-b border-gray-200 ${itemIndex === items.length - 1 && categoryIndex !== Object.keys(groupedItems).length - 1
                                                                ? 'border-b-2 border-gray-300'
                                                                : ''
                                                                } ${(isCustomizable || isFixedWithLimits) && hasValidDishId && !isDisabled && !isAtLimit
                                                                    ? 'cursor-pointer hover:bg-gray-50 transition-colors'
                                                                    : (isDisabled || isAtLimit)
                                                                        ? 'opacity-50 cursor-not-allowed'
                                                                        : !hasValidDishId
                                                                            ? 'opacity-60 cursor-not-allowed'
                                                                            : ''
                                                                } ${(isCustomizable || isFixedWithLimits) && isSelected
                                                                    ? 'bg-green-50 border-l-4 border-l-[#268700]'
                                                                    : ''
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-gray-700">
                                                                    {item.dish?.name || 'Unknown Dish'}
                                                                    {item.quantity > 1 && (
                                                                        <span className="text-gray-500 ml-2">(x{item.quantity})</span>
                                                                    )}
                                                                    {!hasValidDishId && (
                                                                        <span className="text-xs text-red-500 ml-2">(Not available)</span>
                                                                    )}
                                                                    {(isDisabled || isAtLimit) && (
                                                                        <span className="text-xs text-orange-500 ml-2">(Limit reached)</span>
                                                                    )}
                                                                </span>
                                                                {(isCustomizable || isFixedWithLimits) && hasValidDishId && (
                                                                    <div className="ml-4">
                                                                        {isSelected ? (
                                                                            <Check className="w-5 h-5 text-[#268700]" />
                                                                        ) : (
                                                                            <div className={`w-5 h-5 border-2 rounded ${(isDisabled || isAtLimit)
                                                                                ? 'border-gray-200 bg-gray-100'
                                                                                : 'border-gray-300'
                                                                                }`} />
                                                                        )}
                                                                    </div>
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

                            {/* Create Package Button (only for CUSTOMISABLE packages, not FIXED with category selections) */}
                            {isCustomizable &&
                                pkg?.customisation_type === 'CUSTOMISABLE' &&
                                selectedDishIds.size > 0 && (
                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        {packageMessage && (
                                            <div className={`mb-4 p-3 rounded-lg text-sm ${packageMessage.type === 'success'
                                                ? 'bg-green-100 text-green-800 border border-green-300'
                                                : 'bg-red-100 text-red-800 border border-red-300'
                                                }`}>
                                                {packageMessage.text}
                                            </div>
                                        )}
                                        <button
                                            onClick={handleCreateCustomPackage}
                                            disabled={creatingPackage || selectedDishIds.size === 0 || !guests || guests <= 0}
                                            className={`w-full py-3 rounded-full text-white font-medium transition-all ${creatingPackage || selectedDishIds.size === 0 || !guests || guests <= 0
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-[#268700] hover:bg-[#1f6b00] cursor-pointer'
                                                }`}
                                        >
                                            {creatingPackage
                                                ? 'Creating Package...'
                                                : `Create Custom Package (${selectedDishIds.size} ${selectedDishIds.size === 1 ? 'dish' : 'dishes'} selected)`
                                            }
                                        </button>
                                        <p className="text-xs text-gray-500 mt-2 text-center">
                                            Selected dishes will be used to create your custom package
                                        </p>
                                    </div>
                                )}

                            {/* Selection Summary for FIXED packages with category selections */}
                            {isCustomizable &&
                                pkg?.customisation_type === 'FIXED' &&
                                pkg?.category_selections &&
                                pkg.category_selections.length > 0 &&
                                selectedDishIds.size > 0 && (
                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <p className="text-sm font-medium text-blue-900 mb-2">
                                                {selectedDishIds.size} {selectedDishIds.size === 1 ? 'item' : 'items'} selected
                                            </p>
                                            <p className="text-xs text-blue-700">
                                                Complete your selections and click "Add to Cart" below to proceed.
                                            </p>
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* Add to Cart Section - Fixed at bottom */}
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
                            <div className="max-w-7xl mx-auto flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Total Cost</p>
                                    <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                                        <img src="/dirham.svg" alt="AED" className="w-6 h-6" />
                                        {guests > 0 && guests !== pkg.people_count
                                            ? (pkg.total_price * (guests / pkg.people_count)).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                            : pkg.total_price.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {guests > 0 ? guests : pkg.people_count} {guests === 1 ? 'person' : 'people'} × <img src="/dirham.svg" alt="AED" className="w-3 h-3 inline" />{pkg.price_per_person.toLocaleString()}/person
                                    </p>
                                    {/* Show selection status for FIXED packages with category selections */}
                                    {isCustomizable &&
                                        pkg?.customisation_type === 'FIXED' &&
                                        pkg?.category_selections &&
                                        pkg.category_selections.length > 0 && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {selectedDishIds.size} {selectedDishIds.size === 1 ? 'item' : 'items'} selected
                                            </p>
                                        )}
                                </div>
                                <div className="flex items-center gap-4">
                                    {cartMessage && (
                                        <div className={`p-3 rounded-lg text-sm ${cartMessage.type === 'success'
                                            ? 'bg-green-100 text-green-800 border border-green-300'
                                            : 'bg-red-100 text-red-800 border border-red-300'
                                            }`}>
                                            {cartMessage.text}
                                        </div>
                                    )}
                                    <button
                                        onClick={isAddedToCart ? handleRemoveFromCart : handleAddToCart}
                                        disabled={
                                            (addingToCart || removingFromCart) ||
                                            (!pkg) ||
                                            (isAddedToCart ? false : (!eventType || !location || !guests || !date))
                                        }
                                        className={`px-8 py-3 rounded-full text-white font-medium transition-all ${(addingToCart || removingFromCart) || !pkg
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : isAddedToCart
                                                ? 'bg-green-800 hover:bg-green-900 cursor-pointer'
                                                : (!eventType || !location || !guests || !date)
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-[#268700] hover:bg-[#1f6b00] cursor-pointer'
                                            }`}
                                    >
                                        {removingFromCart
                                            ? 'Removing from Cart...'
                                            : addingToCart
                                                ? 'Adding to Cart...'
                                                : isAddedToCart
                                                    ? 'Remove from Cart'
                                                    : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* <Testimonials/> */}
        </>
    );
}