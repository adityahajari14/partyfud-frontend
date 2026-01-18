'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { userApi, Package as ApiPackage } from '@/lib/api/user.api';

interface Package {
    id: string;
    title: string;
    caterer: string;
    catererId: string;
    price: number;
    rating?: number;
    image: string;
    customizable?: boolean;
    discount?: string;
    eventType: string;
    occasionIds?: string[]; // Add occasion IDs for filtering
}

export default function PackagesPage() {
    // Filter states
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [minGuests, setMinGuests] = useState<number | ''>('');
    const [maxGuests, setMaxGuests] = useState<number | ''>('');
    const [minPrice, setMinPrice] = useState<number | ''>('');
    const [maxPrice, setMaxPrice] = useState<number>(10000);
    const [menuType, setMenuType] = useState<'fixed' | 'customizable' | ''>('');
    const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating_desc' | 'created_desc'>('created_desc');
    const [occasionId, setOccasionId] = useState<string>('');
    const [occasionName, setOccasionName] = useState<string>('');
    const [occasionNameParam, setOccasionNameParam] = useState<string>('');
    const [cuisineTypeId, setCuisineTypeId] = useState<string>('');
    const [cuisineTypeName, setCuisineTypeName] = useState<string>('');
    const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
    const [dishId, setDishId] = useState<string>('');
    const [dishName, setDishName] = useState<string>('');

    // Data states
    const [allPackages, setAllPackages] = useState<Package[]>([]); // Store all packages from API
    const [packages, setPackages] = useState<Package[]>([]); // Filtered packages to display
    const [apiPackagesData, setApiPackagesData] = useState<ApiPackage[]>([]); // Store raw API data for people_count access
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [occasions, setOccasions] = useState<Array<{ id: string; name: string }>>([]);

    // Read occasion_id, occasion_name, and cuisine_type_id from URL on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const occasionIdParam = params.get('occasion_id');
            const occasionNameParamValue = params.get('occasion_name');
            const cuisineTypeIdParam = params.get('cuisine_type_id');
            const dishIdParam = params.get('dish_id');

            if (dishIdParam) {
                setDishId(dishIdParam);
                // Fetch dish name
                const fetchDishName = async () => {
                    try {
                        const response = await userApi.getDishById(dishIdParam);
                        if (response.data?.data) {
                            setDishName(response.data.data.name);
                        }
                    } catch (err) {
                        console.error('Error fetching dish name:', err);
                    }
                };
                fetchDishName();
            }

            if (occasionIdParam) {
                setOccasionId(decodeURIComponent(occasionIdParam));
                // Fetch occasion name for display
                const fetchOccasionName = async () => {
                    try {
                        const response = await userApi.getOccasions();
                        if (response.data?.data) {
                            const occasion = response.data.data.find(
                                (occ: any) => occ.id === occasionIdParam
                            );
                            if (occasion) {
                                setOccasionName(occasion.name);
                            }
                        }
                    } catch (err) {
                        console.error('Error fetching occasion name:', err);
                    }
                };
                fetchOccasionName();
            }

            if (occasionNameParamValue) {
                const decodedName = decodeURIComponent(occasionNameParamValue);
                setOccasionNameParam(decodedName);
                setOccasionName(decodedName);
            }

            if (cuisineTypeIdParam) {
                setCuisineTypeId(decodeURIComponent(cuisineTypeIdParam));
                // Fetch cuisine type name for display
                const fetchCuisineTypeName = async () => {
                    try {
                        const response = await userApi.getCuisineTypes();
                        if (response.data) {
                            const cuisineTypes = Array.isArray(response.data)
                                ? response.data
                                : (response.data as any).data || [];
                            const cuisine = cuisineTypes.find(
                                (ct: any) => ct.id === cuisineTypeIdParam
                            );
                            if (cuisine) {
                                setCuisineTypeName(cuisine.name);
                            }
                        }
                    } catch (err) {
                        console.error('Error fetching cuisine type name:', err);
                    }
                };
                fetchCuisineTypeName();
            }
        }
    }, []);

    // Fetch occasions for filter
    useEffect(() => {
        const fetchOccasions = async () => {
            try {
                const response = await userApi.getOccasions();
                if (response.data?.data) {
                    setOccasions(response.data.data.map((occ: any) => ({
                        id: occ.id,
                        name: occ.name,
                    })));
                }
            } catch (err) {
                console.error('Error fetching occasions:', err);
            }
        };
        fetchOccasions();
    }, []);

    // Build filters object for API
    const buildFilters = () => {
        const filters: any = {};

        if (search) {
            filters.search = search;
        }

        if (location) {
            filters.location = location;
        }

        if (minGuests !== '') {
            filters.min_guests = Number(minGuests);
        }

        if (maxGuests !== '') {
            filters.max_guests = Number(maxGuests);
        }

        if (minPrice !== '') {
            filters.min_price = Number(minPrice);
        }

        if (maxPrice !== 10000) {
            filters.max_price = Number(maxPrice);
        }

        if (menuType) {
            filters.menu_type = menuType;
        }

        if (occasionId) {
            filters.occasion_id = occasionId;
        }

        // Support filtering by occasion_name (backend will convert to occasion_id)
        if (occasionNameParam && !occasionId) {
            filters.occasion_name = occasionNameParam;
        }

        if (cuisineTypeId) {
            filters.cuisine_type_id = cuisineTypeId;
        }

        // Don't send occasion_ids to API - we'll filter client-side

        if (sortBy) {
            filters.sort_by = sortBy;
        }

        if (dishId) {
            filters.dish_id = dishId;
        }

        return filters;
    };

    // Fetch packages from API with filters
    useEffect(() => {
        const fetchPackages = async () => {
            setLoading(true);
            setError(null);
            try {
                const filters = buildFilters();
                const response = await userApi.getAllPackages(filters);
                if (response.data?.data) {
                    // Store raw API data
                    setApiPackagesData(response.data.data);

                    // Map API response to component structure
                    const mappedPackages: Package[] = response.data.data
                        .filter((pkg: ApiPackage) => (pkg as any).caterer?.id) // Only include packages with valid caterer ID
                        .map((pkg: ApiPackage) => ({
                            id: pkg.id,
                            title: pkg.name,
                            caterer: (pkg as any).caterer?.name || 'Unknown Caterer',
                            catererId: (pkg as any).caterer?.id, // Get caterer ID for navigation
                            price: pkg.total_price,
                            rating: pkg.rating || undefined,
                            image: pkg.cover_image_url || '/logo2.svg',
                            customizable: pkg.customisation_type === 'CUSTOMISABLE' || pkg.customisation_type === 'CUSTOMIZABLE',
                            discount: undefined, // Can be added if discount logic exists
                            eventType: pkg.occasions?.[0]?.occasion?.name || 'All',
                            occasionIds: pkg.occasions?.map((occ: any) => occ.occasion?.id).filter(Boolean) || [], // Store all occasion IDs
                        }));
                    setAllPackages(mappedPackages); // Store all packages
                    setPackages(mappedPackages); // Initially show all
                }
            } catch (err: any) {
                console.error('Error fetching packages:', err);
                setError(err.message || 'Failed to fetch packages');
                setPackages([]);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search to avoid too many API calls
        const timeoutId = setTimeout(() => {
            fetchPackages();
        }, search ? 500 : 0);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, location, minGuests, maxGuests, minPrice, maxPrice, menuType, sortBy, occasionId, occasionNameParam, cuisineTypeId, dishId]); // Removed selectedOccasions

    // Client-side filtering by selected occasions
    useEffect(() => {
        if (selectedOccasions.length === 0) {
            // No occasion filter - show all packages
            setPackages(allPackages);
        } else {
            // Filter packages that have at least one of the selected occasions
            const filtered = allPackages.filter(pkg => {
                const pkgOccasionIds = (pkg as any).occasionIds || [];
                return selectedOccasions.some(selectedId => pkgOccasionIds.includes(selectedId));
            });
            setPackages(filtered);
        }
    }, [selectedOccasions, allPackages]);

    const handleClearFilters = () => {
        setSearch('');
        setLocation('');
        setMinGuests('');
        setMaxGuests('');
        setMinPrice('');
        setMaxPrice(10000);
        setMenuType('');
        setSortBy('created_desc');
        setOccasionId('');
        setOccasionName('');
        setCuisineTypeName('');
        setSelectedOccasions([]);
        setDishId('');
        setDishName('');
        // Clear URL parameters
        if (occasionId || occasionNameParam || cuisineTypeId || dishId) {
            window.history.replaceState({}, '', '/packages');
        }
    };

    return (
        <section className="bg-[#FAFAFA] min-h-screen">
            <h1 className='mt-5 ml-36 text-3xl font-semibold'>Browse from Packages</h1>

            {/* Occasion Filters */}
            {occasions.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 mt-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">
                            Filter by Occasions <span className="text-gray-500 font-normal">(Select all that apply)</span>
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {occasions.map((occasion) => (
                                <label
                                    key={occasion.id}
                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedOccasions.includes(occasion.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedOccasions([...selectedOccasions, occasion.id]);
                                            } else {
                                                setSelectedOccasions(selectedOccasions.filter(id => id !== occasion.id));
                                            }
                                        }}
                                        className="w-4 h-4 text-[#268700] border-gray-300 rounded focus:ring-[#268700]"
                                    />
                                    <span className="text-sm text-gray-700">{occasion.name}</span>
                                </label>
                            ))}
                        </div>
                        {selectedOccasions.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    {selectedOccasions.length} occasion{selectedOccasions.length !== 1 ? 's' : ''} selected
                                </span>
                                <button
                                    onClick={() => setSelectedOccasions([])}
                                    className="text-sm text-[#268700] hover:text-[#1f6b00] font-medium"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">

                {/* LEFT FILTERS */}
                <aside className="bg-white border border-gray-200 rounded-xl p-4 h-fit">
                    <div className="flex justify-between mb-4">
                        <h3 className="font-medium">Filters</h3>
                        <button
                            onClick={handleClearFilters}
                            className="text-sm text-gray-500 border border-gray-200 py-1 cursor-pointer px-2 rounded-xl hover:bg-gray-100"
                        >
                            Clear
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mb-4">
                        <label className="text-sm text-gray-500 mb-2 block">Search</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search packages..."
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2"
                        />
                    </div>

                    {/* Location */}
                    <div className="mb-4">
                        <label className="text-sm text-gray-500 mb-2 block">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., Dubai, Abu Dhabi"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2"
                        />
                    </div>

                    {/* Guests Range */}
                    <div className="mb-4">
                        <label className="text-sm text-gray-500 mb-2 block">Guests</label>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                value={minGuests}
                                onChange={(e) => setMinGuests(e.target.value ? Number(e.target.value) : '')}
                                placeholder="Min"
                                min="1"
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2"
                            />
                            <input
                                type="number"
                                value={maxGuests}
                                onChange={(e) => setMaxGuests(e.target.value ? Number(e.target.value) : '')}
                                placeholder="Max"
                                min="1"
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="mb-4">
                        <label className="text-sm text-gray-500 mb-2 block flex items-center gap-1">
                            Max Price (<img src="/dirham.svg" alt="AED" className="w-3 h-3 inline" />)
                        </label>
                        <input
                            type="range"
                            min={1000}
                            max={50000}
                            step={1000}
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className="w-full mt-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><img src="/dirham.svg" alt="AED" className="w-3 h-3" />1,000</span>
                            <span className="flex items-center gap-1"><img src="/dirham.svg" alt="AED" className="w-3 h-3" />{maxPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Min Price */}
                    <div className="mb-4">
                        <label className="text-sm text-gray-500 mb-2 block flex items-center gap-1">
                            Min Price (<img src="/dirham.svg" alt="AED" className="w-3 h-3 inline" />)
                        </label>
                        <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                            placeholder="Minimum price"
                            min="0"
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2"
                        />
                    </div>

                    {/* Menu Type */}
                    <div className="mb-4">
                        <label className="text-sm text-gray-500 mb-2 block">Menu Type</label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="menuType"
                                    checked={menuType === 'fixed'}
                                    onChange={() => setMenuType('fixed')}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Fixed</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="menuType"
                                    checked={menuType === 'customizable'}
                                    onChange={() => setMenuType('customizable')}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">Customizable</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="menuType"
                                    checked={menuType === ''}
                                    onChange={() => setMenuType('')}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">All</span>
                            </label>
                        </div>
                    </div>
                </aside>

                {/* RIGHT CONTENT */}
                <div>
                    {/* Active Filter Indicators */}
                    {(occasionName || cuisineTypeName) && (
                        <div className="mb-4 space-y-2">
                            {occasionName && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-green-700 font-medium">
                                            Filtered by Occasion: <strong>{occasionName}</strong>
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setOccasionId('');
                                            setOccasionName('');
                                            setOccasionNameParam('');
                                            const params = new URLSearchParams(window.location.search);
                                            params.delete('occasion_id');
                                            params.delete('occasion_name');
                                            const newUrl = params.toString()
                                                ? `/packages?${params.toString()}`
                                                : '/packages';
                                            window.history.replaceState({}, '', newUrl);
                                        }}
                                        className="text-sm text-green-700 hover:text-green-900 underline"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                            {cuisineTypeName && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-green-700 font-medium">
                                            Filtered by Cuisine: <strong>{cuisineTypeName}</strong>
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setCuisineTypeId('');
                                            setCuisineTypeName('');
                                            const params = new URLSearchParams(window.location.search);
                                            params.delete('cuisine_type_id');
                                            const newUrl = params.toString()
                                                ? `/packages?${params.toString()}`
                                                : '/packages';
                                            window.history.replaceState({}, '', newUrl);
                                        }}
                                        className="text-sm text-green-700 hover:text-green-900 underline"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                            {dishName && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-green-700 font-medium">
                                            Packages including: <strong>{dishName}</strong>
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setDishId('');
                                            setDishName('');
                                            const params = new URLSearchParams(window.location.search);
                                            params.delete('dish_id');
                                            const newUrl = params.toString()
                                                ? `/packages?${params.toString()}`
                                                : '/packages';
                                            window.history.replaceState({}, '', newUrl);
                                        }}
                                        className="text-sm text-green-700 hover:text-green-900 underline"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Search Bar and Sort */}
                    <div className="flex items-center gap-4 mb-6">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search for a Package, Food Item"
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2"
                        />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2"
                        >
                            <option value="created_desc">Newest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="rating_desc">Highest Rated</option>
                        </select>
                    </div>

                    {/* Packages Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700]"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    ) : packages.length === 0 ? (
                        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded text-center">
                            <p>No packages found matching your filters.</p>
                            <p className="text-sm mt-2">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-gray-600">
                                Showing {packages.length} package{packages.length !== 1 ? 's' : ''}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {packages.map((pkg) => {
                                    const apiPkg = apiPackagesData.find((p: any) => p.id === pkg.id);
                                    const minimumPeople = apiPkg?.minimum_people || apiPkg?.people_count || 1;

                                    return (
                                        <div
                                            key={pkg.id}
                                            className="bg-white rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                                        >
                                            {/* Image Section */}
                                            <div className="relative h-[240px] w-full bg-gray-50">
                                                <Image
                                                    src={pkg.image}
                                                    alt={pkg.title}
                                                    fill
                                                    className="object-contain p-4"
                                                />

                                                {/* Badges */}
                                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                                    {pkg.customizable && (
                                                        <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                                            Customisable
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content Section */}
                                            <div className="p-5 flex flex-col flex-1">
                                                {/* Caterer Name with Verified Badge */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <svg className="w-4 h-4 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                    <span className="text-sm font-bold text-gray-700">{pkg.caterer}</span>
                                                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>

                                                {/* Package Name */}
                                                <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">
                                                    {pkg.title}
                                                </h3>


                                                {/* Package Description */}
                                                {apiPkg?.description && (
                                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                                                        {apiPkg.description}
                                                    </p>
                                                )}

                                                {/* Rating and People Count */}
                                                <div className="flex items-center gap-4 mb-4">
                                                    {pkg.rating && (
                                                        <div className="flex items-center gap-1.5">
                                                            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                            <span className="text-sm font-bold text-gray-900">{Number(pkg.rating).toFixed(1)}</span>
                                                            <span className="text-xs text-gray-400">(43)</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        <span className="text-sm font-bold text-gray-700">Min. {minimumPeople}</span>
                                                    </div>
                                                </div>

                                                {/* Spacer to push price/button to bottom */}
                                                <div className="flex-1"></div>

                                                {/* Price and Button */}
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                    <div>
                                                        <div className="text-xs text-gray-500 mb-0.5">Starting from</div>
                                                        <div className="text-2xl font-black text-gray-900">
                                                            AED {typeof pkg.price === 'number' ? pkg.price.toLocaleString() : parseInt(String(pkg.price || '0'), 10).toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-gray-400 font-medium mt-0.5">for {minimumPeople} people</div>
                                                    </div>
                                                    <Link
                                                        href={`/caterers/${pkg.catererId}/${pkg.id}`}
                                                        className="bg-[#268700] hover:bg-[#1f6b00] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-95"
                                                    >
                                                        View Package
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
