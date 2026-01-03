'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { userApi, Dish } from '@/lib/api/user.api';

interface DishCard {
    id: string;
    name: string;
    caterer: string;
    catererId?: string;
    price: number;
    image: string;
    cuisineType: string;
    category: string;
    subCategory?: string;
}

export default function MenuPage() {
    // Filter states
    const [search, setSearch] = useState('');
    const [minPrice, setMinPrice] = useState<number | ''>('');
    const [maxPrice, setMaxPrice] = useState<number>(1000);
    const [groupByCategory, setGroupByCategory] = useState(false);
    const [cuisineTypeId, setCuisineTypeId] = useState<string | undefined>(undefined);

    // Read cuisine_type_id from URL on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const cuisineId = params.get('cuisine_type_id');
            if (cuisineId) {
                setCuisineTypeId(cuisineId);
            }
        }
    }, []);
    
    // Data states
    const [dishes, setDishes] = useState<DishCard[]>([]);
    const [dishesByCategory, setDishesByCategory] = useState<Array<{
        category: { id: string; name: string; description?: string | null };
        dishes: DishCard[];
    }>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    // Build filters object for API
    const buildFilters = () => {
        const filters: any = {};

        if (search) {
            filters.search = search;
        }

        if (cuisineTypeId) {
            filters.cuisine_type_id = cuisineTypeId;
        }

        if (minPrice !== '') {
            filters.min_price = Number(minPrice);
        }

        if (maxPrice !== 1000) {
            filters.max_price = Number(maxPrice);
        }

        if (groupByCategory) {
            filters.group_by_category = true;
        }

        return filters;
    };

    // Fetch dishes from API with filters
    useEffect(() => {
        const fetchDishes = async () => {
            setLoading(true);
            setError(null);
            try {
                const filters = buildFilters();
                const response = await userApi.getAllDishes(filters);
                
                if (response.data?.data) {
                    const data = response.data.data;
                    
                    // Check if data is grouped by category
                    if (groupByCategory && 'categories' in data) {
                        const categoriesData = (data as any).categories;
                        const mappedCategories = categoriesData.map((catGroup: any) => ({
                            category: catGroup.category,
                            dishes: catGroup.dishes.map((dish: Dish) => ({
                                id: dish.id,
                                name: dish.name,
                                caterer: dish.caterer?.name || 'Unknown Caterer',
                                catererId: dish.caterer?.id,
                                price: dish.price,
                                image: dish.image_url || '/default_dish.jpg',
                                cuisineType: dish.cuisine_type.name,
                                category: dish.category.name,
                                subCategory: dish.sub_category?.name,
                            })),
                        }));
                        setDishesByCategory(mappedCategories);
                        setDishes([]);
                    } else {
                        // Flat array
                        const dishesArray = Array.isArray(data) ? data : [];
                        const mappedDishes: DishCard[] = dishesArray.map((dish: Dish) => ({
                            id: dish.id,
                            name: dish.name,
                            caterer: dish.caterer?.name || 'Unknown Caterer',
                            catererId: dish.caterer?.id,
                            price: dish.price,
                            image: dish.image_url || '/default_dish.jpg',
                            cuisineType: dish.cuisine_type.name,
                            category: dish.category.name,
                            subCategory: dish.sub_category?.name,
                        }));
                        setDishes(mappedDishes);
                        setDishesByCategory([]);
                    }
                }
            } catch (err: any) {
                console.error('Error fetching dishes:', err);
                setError(err.message || 'Failed to fetch dishes');
                setDishes([]);
                setDishesByCategory([]);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search to avoid too many API calls
        const timeoutId = setTimeout(() => {
            fetchDishes();
        }, search ? 500 : 0);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, minPrice, maxPrice, groupByCategory, cuisineTypeId]);

    const handleClearFilters = () => {
        setSearch('');
        setMinPrice('');
        setMaxPrice(1000);
        setGroupByCategory(false);
        setCuisineTypeId(undefined);
        // Clear URL parameter
        if (cuisineTypeId) {
            window.history.replaceState({}, '', '/user/menu');
        }
    };

    // Get all dishes from all categories for count
    const getAllDishesFromCategories = () => {
        return dishesByCategory.flatMap(cat => cat.dishes);
    };

    const displayDishes = groupByCategory ? getAllDishesFromCategories() : dishes;

    return (
        <section className="bg-[#FAFAFA] min-h-screen">
            <h1 className='mt-5 ml-36 text-3xl font-semibold'>Browse Menu Items</h1>
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
                            placeholder="Search dishes..."
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2"
                        />
                    </div>

                    {/* Price Range */}
                    <div className="mb-4">
                        <label className="text-sm text-gray-500 mb-2 block">Max Price (AED)</label>
                        <input
                            type="range"
                            min={10}
                            max={1000}
                            step={10}
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className="w-full mt-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>AED 10</span>
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

                    {/* Group by Category */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={groupByCategory}
                                onChange={(e) => setGroupByCategory(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">Group by Category</span>
                        </label>
                    </div>
                </aside>

                {/* RIGHT CONTENT */}
                <div>
                    {/* Active Filter Indicator */}
                    {cuisineTypeId && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-green-700 font-medium">
                                    Filtered by Cuisine Type
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

                    {/* Search Bar */}
                    <div className="flex items-center gap-4 mb-6">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search for a Dish"
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2"
                        />
                    </div>

                    {/* Dishes Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700]"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    ) : displayDishes.length === 0 ? (
                        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded text-center">
                            <p>No dishes found matching your filters.</p>
                            <p className="text-sm mt-2">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 text-sm text-gray-600">
                                Showing {displayDishes.length} dish{displayDishes.length !== 1 ? 'es' : ''}
                            </div>

                            {groupByCategory ? (
                                // Grouped by Category View
                                <div className="space-y-6">
                                    {dishesByCategory.map((categoryGroup) => (
                                        <div key={categoryGroup.category.id} className="space-y-4">
                                            {/* Category Header */}
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {categoryGroup.category.name}
                                                </h3>
                                                <span className="text-sm text-gray-500">
                                                    ({categoryGroup.dishes.length} {categoryGroup.dishes.length === 1 ? 'dish' : 'dishes'})
                                                </span>
                                                {categoryGroup.category.description && (
                                                    <span className="text-sm text-gray-400 italic">
                                                        - {categoryGroup.category.description}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Dishes Grid for this Category */}
                                            {categoryGroup.dishes.length === 0 ? (
                                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                                    <p className="text-sm text-gray-400">No dishes in this category</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {categoryGroup.dishes.map((dish) => (
                                                        <Link
                                                            key={dish.id}
                                                            href={`/user/menu/${dish.id}`}
                                                            className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition cursor-pointer block"
                                                        >
                                                            <div className="relative h-[180px] rounded-lg overflow-hidden">
                                                                <Image
                                                                    src={dish.image}
                                                                    alt={dish.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <h4 className="mt-3 font-medium">{dish.name}</h4>
                                                            <p className="text-sm text-gray-500">{dish.caterer}</p>
                                                            <div className="flex items-center justify-between mt-2">
                                                                <span className="text-xs text-gray-400">{dish.cuisineType}</span>
                                                                <p className="font-semibold">
                                                                    AED {dish.price.toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Flat Grid View
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {dishes.map((dish) => (
                                        <Link
                                            key={dish.id}
                                            href={`/user/menu/${dish.id}`}
                                            className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition cursor-pointer block"
                                        >
                                            <div className="relative h-[180px] rounded-lg overflow-hidden">
                                                <Image
                                                    src={dish.image}
                                                    alt={dish.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <h4 className="mt-3 font-medium">{dish.name}</h4>
                                            <p className="text-sm text-gray-500">{dish.caterer}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-gray-400">{dish.cuisineType} • {dish.category}</span>
                                                <p className="font-semibold">
                                                    AED {dish.price.toLocaleString()}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

