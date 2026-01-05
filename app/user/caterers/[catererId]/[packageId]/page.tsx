'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import React from 'react';
import { userApi, type Package } from '@/lib/api/user.api';
import { Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
// import { Testimonials } from '@/user/Testimonials';

interface PackageType {
    id: string;
    name: string;
    image_url?: string | null;
    description?: string | null;
}

export default function PackageDetailsPage() {
    const [eventType, setEventType] = useState('');
    const [location, setLocation] = useState('');
    const [guests, setGuests] = useState<number>(0);
    const [date, setDate] = useState('');
    const [pkg, setPkg] = useState<Package | null>(null);
    const [packageTypes, setPackageTypes] = useState<PackageType[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingTypes, setLoadingTypes] = useState(true);
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

    // Fetch package types
    useEffect(() => {
        const fetchPackageTypes = async () => {
            setLoadingTypes(true);
            try {
                const response = await userApi.getPackageTypes();
                
                if (response.error) {
                    console.error('Failed to fetch package types:', response.error);
                } else if (response.data?.data) {
                    setPackageTypes(response.data.data);
                }
            } catch (err) {
                console.error('Error fetching package types:', err);
            } finally {
                setLoadingTypes(false);
            }
        };

        fetchPackageTypes();
    }, []);

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
                    setPkg(packageData);
                    // Set default event type to the package's type if available
                    if (packageData.package_type?.id) {
                        setEventType(packageData.package_type.id);
                    }
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
    }, [packageId]);

    // Check if package is already in cart
    useEffect(() => {
        const checkCartStatus = async () => {
            if (!packageId) return;
            
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

    // Handle Add to Cart
    const handleAddToCart = async () => {
        // Check authentication first
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setCartMessage({ type: 'error', text: 'Please log in to add items to cart' });
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
            return;
        }

        if (!pkg) {
            setCartMessage({ type: 'error', text: 'Package information not available' });
            return;
        }

        // Validate required fields
        if (!eventType) {
            setCartMessage({ type: 'error', text: 'Please select an event type' });
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

            const cartData = {
                package_id: pkg.id,
                package_type_id: eventType,
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

    // Check if package is customizable
    const isCustomizable = pkg?.customisation_type === 'CUSTOMISABLE' || pkg?.customisation_type === 'CUSTOMIZABLE';

    // Toggle dish selection
    const toggleDishSelection = (dishId: string) => {
        if (!isCustomizable) return;
        
        const newSelected = new Set(selectedDishIds);
        if (newSelected.has(dishId)) {
            newSelected.delete(dishId);
        } else {
            newSelected.add(dishId);
        }
        setSelectedDishIds(newSelected);
    };

    // Check if dish is selected
    const isDishSelected = (dishId: string) => {
        return selectedDishIds.has(dishId);
    };

    // Handle Create Custom Package
    const handleCreateCustomPackage = async () => {
        if (!pkg || selectedDishIds.size === 0 || !user) {
            setPackageMessage({ type: 'error', text: 'Please select at least one dish' });
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
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">

                {/* LEFT CONTENT */}
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
                            Menu Items {pkg.category_selections.length > 0 ? '(Customizable)' : '(Fixed)'}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4">
                            Package includes {pkg.items.length} items for {pkg.people_count} people.
                        </p>

                        {/* List grouped by category */}
                        <div className="space-y-0">
                            {Object.entries(groupedItems).map(([category, items]: [string, any], categoryIndex) => (
                                <div key={category} className="mb-0">
                                    {/* Category Header with light grey background */}
                                    <div className="bg-gray-100 py-2 px-4 font-semibold text-gray-900">
                                        {category}
                                    </div>
                                    
                                    {/* Dishes List */}
                                    <div className="bg-white">
                                        {items.map((item: any, itemIndex: number) => {
                                            // Only allow selection if dish has a valid ID
                                            const dishId = item.dish?.id;
                                            const hasValidDishId = dishId && dishId.trim() !== '';
                                            const isSelected = hasValidDishId ? isDishSelected(dishId) : false;
                                            
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => hasValidDishId && toggleDishSelection(dishId)}
                                                    className={`py-3 px-4 border-b border-gray-200 ${
                                                        itemIndex === items.length - 1 && categoryIndex !== Object.keys(groupedItems).length - 1
                                                            ? 'border-b-2 border-gray-300'
                                                            : ''
                                                    } ${
                                                        isCustomizable && hasValidDishId
                                                            ? 'cursor-pointer hover:bg-gray-50 transition-colors'
                                                            : !hasValidDishId
                                                            ? 'opacity-60 cursor-not-allowed'
                                                            : ''
                                                    } ${
                                                        isCustomizable && isSelected
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
                                                        </span>
                                                        {isCustomizable && hasValidDishId && (
                                                            <div className="ml-4">
                                                                {isSelected ? (
                                                                    <Check className="w-5 h-5 text-[#268700]" />
                                                                ) : (
                                                                    <div className="w-5 h-5 border-2 border-gray-300 rounded" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Category Selections (if customizable) */}
                        {pkg.category_selections.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <h4 className="font-medium mb-2">Customizable Categories</h4>
                                {pkg.category_selections.map((selection) => (
                                    <div key={selection.id} className="text-sm text-gray-600 mb-1">
                                        {selection.category.name}: Select {selection.num_dishes_to_select} dish(es)
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Create Package Button (only for customizable packages when dishes are selected) */}
                        {isCustomizable && selectedDishIds.size > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                {packageMessage && (
                                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                                        packageMessage.type === 'success' 
                                            ? 'bg-green-100 text-green-800 border border-green-300' 
                                            : 'bg-red-100 text-red-800 border border-red-300'
                                    }`}>
                                        {packageMessage.text}
                                    </div>
                                )}
                                <button
                                    onClick={handleCreateCustomPackage}
                                    disabled={creatingPackage || selectedDishIds.size === 0 || !guests || guests <= 0}
                                    className={`w-full py-3 rounded-full text-white font-medium transition-all ${
                                        creatingPackage || selectedDishIds.size === 0 || !guests || guests <= 0
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
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <aside className="bg-white border border-gray-200 rounded-xl p-5 h-fit">
                    <button className="text-sm text-gray-600 mb-2">
                        ← {pkg.name}
                    </button>

                    <h2 className="font-semibold text-lg">{pkg.name}</h2>
                    <p className="text-sm text-gray-500">{pkg.package_type.name}</p>

                    {pkg.rating && (
                        <div className="text-sm mt-2">
                            ⭐ {pkg.rating}
                        </div>
                    )}

                    <p className="mt-2 font-semibold">
                        AED {pkg.price_per_person.toLocaleString()}/Person
                    </p>
                    <p className="text-sm text-gray-500">
                        Total: AED {pkg.total_price.toLocaleString()} for {pkg.people_count} people
                    </p>

                    {/* Controls */}
                    <div className="mt-4 space-y-3">
                        {/* Event Type */}
                        <div>
                            <label className="block px-1 text-sm py-2">
                                Event Type
                            </label>
                            <select
                                name="eventType"
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#268700]"
                                disabled={loadingTypes}
                            >
                                <option value="" className="text-black">
                                    {loadingTypes ? 'Loading...' : 'Select Event Type'}
                                </option>
                                {packageTypes.map((type) => (
                                    <option key={type.id} value={type.id} className="text-black">
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block px-1 text-sm py-2">
                                Location
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

                        <div>
                            <label className="block px-1 text-sm py-2">
                                Guests
                            </label>
                            <select
                                name="guests"
                                value={guests}
                                onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#268700]"
                                disabled={!pkg || !pkg.people_count}
                            >
                                {pkg && pkg.people_count ? (
                                    Array.from({ length: 10 }, (_, i) => {
                                        const guestCount = pkg.people_count * (i + 1);
                                        return (
                                            <option key={guestCount} value={guestCount} className="text-black">
                                                {guestCount} {guestCount === 1 ? 'guest' : 'guests'}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="0" className="text-black">Loading...</option>
                                )}
                            </select>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 mb-4 focus:outline-none focus:border-[#268700]"
                            />
                        </div>

                    </div>

                    <div className="mt-4 font-semibold">
                        Total Cost
                        <div className="text-lg">
                            AED {guests > 0 && guests !== pkg.people_count 
                                ? (pkg.total_price * (guests / pkg.people_count)).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                : pkg.total_price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 font-normal">
                            ({guests > 0 ? guests : pkg.people_count} {guests === 1 ? 'person' : 'people'} × AED {pkg.price_per_person.toLocaleString()}/person)
                        </div>
                    </div>

                    {/* Cart Message */}
                    {cartMessage && (
                        <div className={`mt-4 p-3 rounded-lg text-sm ${
                            cartMessage.type === 'success' 
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
                        className={`mt-4 w-full py-3 rounded-full text-white font-medium transition-all ${
                            (addingToCart || removingFromCart) || !pkg
                                ? 'bg-gray-400 cursor-not-allowed'
                                : isAddedToCart
                                ? 'bg-green-800 hover:bg-green-900 cursor-pointer'
                                : (!eventType || !location || !guests || !date)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:opacity-90 cursor-pointer'
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
                </aside>
            </div>
        </section>
        {/* <Testimonials/> */}
        </>
    );
}