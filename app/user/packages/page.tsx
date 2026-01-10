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
    const [packageType, setPackageType] = useState<string>('');
    const [occasionId, setOccasionId] = useState<string>('');
    const [occasionName, setOccasionName] = useState<string>('');
    const [occasionNameParam, setOccasionNameParam] = useState<string>('');
    const [cuisineTypeId, setCuisineTypeId] = useState<string>('');
    const [cuisineTypeName, setCuisineTypeName] = useState<string>('');
    const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);

    // Data states
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [occasions, setOccasions] = useState<Array<{ id: string; name: string }>>([]);

    // Read package_type, occasion_id, occasion_name, and cuisine_type_id from URL on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const typeParam = params.get('package_type');
            const occasionIdParam = params.get('occasion_id');
            const occasionNameParamValue = params.get('occasion_name');
            const cuisineTypeIdParam = params.get('cuisine_type_id');

            if (typeParam) {
                setPackageType(decodeURIComponent(typeParam));
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

        if (packageType) {
            filters.package_type = packageType;
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

        // Add selected occasions filter
        if (selectedOccasions.length > 0) {
            filters.occasion_ids = selectedOccasions;
        }

        if (sortBy) {
            filters.sort_by = sortBy;
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
                    // Map API response to component structure
                    const mappedPackages: Package[] = response.data.data
                        .filter((pkg: ApiPackage) => (pkg as any).caterer?.id) // Only include packages with valid caterer ID
                        .map((pkg: ApiPackage) => ({
                            id: pkg.id,
                            title: pkg.name,
                            caterer: (pkg as any).caterer?.name || pkg.package_type?.name || 'Unknown Caterer',
                            catererId: (pkg as any).caterer?.id, // Get caterer ID for navigation
                            price: pkg.total_price,
                            rating: pkg.rating || undefined,
                            image: pkg.cover_image_url || '/logo_partyfud.svg',
                            customizable: pkg.customisation_type === 'CUSTOMISABLE' || pkg.customisation_type === 'CUSTOMIZABLE',
                            discount: undefined, // Can be added if discount logic exists
                            eventType: pkg.occasions?.[0]?.occasion?.name || 'All',
                        }));
                    setPackages(mappedPackages);
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
    }, [search, location, minGuests, maxGuests, minPrice, maxPrice, menuType, sortBy, packageType, occasionId, occasionNameParam, cuisineTypeId, selectedOccasions]);

    const handleClearFilters = () => {
        setSearch('');
        setLocation('');
        setMinGuests('');
        setMaxGuests('');
        setMinPrice('');
        setMaxPrice(10000);
        setMenuType('');
        setSortBy('created_desc');
        setPackageType('');
        setOccasionId('');
        setOccasionName('');
        setOccasionNameParam('');
        setCuisineTypeId('');
        setCuisineTypeName('');
        setSelectedOccasions([]);
        // Clear URL parameters
        if (packageType || occasionId || occasionNameParam || cuisineTypeId) {
            window.history.replaceState({}, '', '/user/packages');
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
                    {(packageType || occasionName || cuisineTypeName || menuType || selectedOccasions.length > 0) && (
                        <div className="mb-4 space-y-2">
                            {packageType && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-green-700 font-medium">
                                            Filtered by Package Type: <strong>{packageType}</strong>
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setPackageType('');
                                            const params = new URLSearchParams(window.location.search);
                                            params.delete('package_type');
                                            const newUrl = params.toString()
                                                ? `/user/packages?${params.toString()}`
                                                : '/user/packages';
                                            window.history.replaceState({}, '', newUrl);
                                        }}
                                        className="text-sm text-green-700 hover:text-green-900 underline"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
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
                                                ? `/user/packages?${params.toString()}`
                                                : '/user/packages';
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
                                                ? `/user/packages?${params.toString()}`
                                                : '/user/packages';
                                            window.history.replaceState({}, '', newUrl);
                                        }}
                                        className="text-sm text-green-700 hover:text-green-900 underline"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                            {menuType && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-blue-700 font-medium">
                                            Menu Type: <strong>{menuType === 'fixed' ? 'Fixed' : 'Customizable'}</strong>
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setMenuType('')}
                                        className="text-sm text-blue-700 hover:text-blue-900 underline"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                            {selectedOccasions.length > 0 && (
                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-purple-700 font-medium">
                                            Occasions Selected: <strong>{selectedOccasions.length}</strong>
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedOccasions([])}
                                        className="text-sm text-purple-700 hover:text-purple-900 underline"
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {packages.map((pkg) => (
                                    <Link
                                        key={pkg.id}
                                        href={`/user/caterers/${pkg.catererId}/${pkg.id}`}
                                        className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition cursor-pointer block"
                                    >
                                        <div className="relative h-[180px] rounded-lg overflow-hidden">
                                            <Image
                                                src={pkg.image}
                                                alt={pkg.title}
                                                fill
                                                className="object-cover"
                                            />

                                            <div className="absolute top-2 left-2 flex gap-2">
                                                {pkg.discount && (
                                                    <span className="bg-white text-xs px-2 py-1 rounded-full">
                                                        {pkg.discount}
                                                    </span>
                                                )}
                                                {pkg.customizable && (
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                                        Customisable
                                                    </span>
                                                )}
                                            </div>

                                            {pkg.rating && (
                                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                                    ⭐ {Number(pkg.rating).toFixed(1)}
                                                </div>
                                            )}
                                        </div>

                                        <h4 className="mt-3 font-medium">{pkg.title}</h4>
                                        <p className="text-sm text-gray-500">{pkg.caterer}</p>
                                        <p className="mt-2 font-semibold flex items-center gap-1">
                                            <img src="/dirham.svg" alt="AED" className="w-4 h-4" />
                                            {pkg.price.toLocaleString()}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
