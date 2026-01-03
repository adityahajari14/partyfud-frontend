'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import React from 'react';
import { userApi, type Package } from '@/lib/api/user.api';
// import { Testimonials } from '@/user/Testimonials';

export default function PackageDetailsPage() {
    const [eventType, setEventType] = useState('All');
    const [location, setLocation] = useState('All');
    const [guests, setGuests] = useState('All');
    const [date, setDate] = useState('');
    const [pkg, setPkg] = useState<Package | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const params = useParams();
    const packageId = params.packageId as string;

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
                    setPkg(response.data.data);
                }
            } catch (err) {
                setError('Failed to fetch package');
            } finally {
                setLoading(false);
            }
        };

        fetchPackage();
    }, [packageId]);

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
                                        {items.map((item: any, itemIndex: number) => (
                                            <div
                                                key={item.id}
                                                className={`py-3 px-4 border-b border-gray-200 ${
                                                    itemIndex === items.length - 1 && categoryIndex !== Object.keys(groupedItems).length - 1
                                                        ? 'border-b-2 border-gray-300'
                                                        : ''
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-700">
                                                        {item.dish?.name || 'Unknown Dish'}
                                                        {item.quantity > 1 && (
                                                            <span className="text-gray-500 ml-2">(x{item.quantity})</span>
                                                        )}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {item.is_optional && (
                                                            <span className="text-xs text-gray-500">Optional</span>
                                                        )}
                                                        {item.is_addon && (
                                                            <span className="text-xs text-gray-500">Add-on</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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
                            >
                                <option className="text-black">All</option>
                                <option className="text-black">Bakery</option>
                                <option className="text-black">Birthday</option>
                                <option className="text-black">Wedding</option>
                                <option className="text-black">Corporate</option>
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
                                <option className="text-black">Dubai</option>
                                <option className="text-black">Bakery</option>
                                <option className="text-black">Birthday</option>
                                <option className="text-black">Wedding</option>
                                <option className="text-black">Corporate</option>
                            </select>
                        </div>

                        <div>
                            <label className="block px-1 text-sm py-2">
                                Guests
                            </label>
                            <select
                                name="guests"
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#268700]"
                            >
                                <option className="text-black">120</option>
                                <option className="text-black">Bakery</option>
                                <option className="text-black">Birthday</option>
                                <option className="text-black">Wedding</option>
                                <option className="text-black">Corporate</option>
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
                            AED {pkg.total_price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 font-normal">
                            ({pkg.people_count} people × AED {pkg.price_per_person.toLocaleString()}/person)
                        </div>
                    </div>

                    <button className="mt-4 w-full bg-green-600 text-white py-3 rounded-full hover:opacity-90 cursor-pointer">
                        Add to Cart
                    </button>
                </aside>
            </div>
        </section>
        {/* <Testimonials/> */}
        </>
    );
}