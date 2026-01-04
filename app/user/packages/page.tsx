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
    
    // Data states
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Read package_type from URL on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const typeParam = params.get('package_type');
            if (typeParam) {
                setPackageType(decodeURIComponent(typeParam));
            }
        }
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
                            image: pkg.cover_image_url || '/default_dish.jpg',
                            customizable: pkg.items?.some((item: any) => item.is_optional) || pkg.category_selections?.length > 0 || false,
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
    }, [search, location, minGuests, maxGuests, minPrice, maxPrice, menuType, sortBy, packageType]);

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
        // Clear URL parameter
        if (packageType) {
            window.history.replaceState({}, '', '/user/packages');
        }
    };

    return (
        <section className="bg-[#FAFAFA] min-h-screen">
            <h1 className='mt-5 ml-36 text-3xl font-semibold'>Browse from Packages</h1>
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
                        <label className="text-sm text-gray-500 mb-2 block">Max Price (AED)</label>
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
                            <span>AED 1,000</span>
                            <span>AED {maxPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Min Price */}
                    <div className="mb-4">
                        <label className="text-sm text-gray-500 mb-2 block">Min Price (AED)</label>
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
                    {/* Active Filter Indicator */}
                    {packageType && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-green-700 font-medium">
                                    Filtered by Package Type: <strong>{packageType}</strong>
                                </span>
                            </div>
                            <button
                                onClick={handleClearFilters}
                                className="text-sm text-green-700 hover:text-green-900 underline"
                            >
                                Clear Filter
                            </button>
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
                                        <p className="mt-2 font-semibold">
                                            AED {pkg.price.toLocaleString()}
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
