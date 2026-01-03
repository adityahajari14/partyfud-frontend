'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { userApi, Dish } from '@/lib/api/user.api';

export default function DishDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const dishId = params.id as string;
    
    const [dish, setDish] = useState<Dish | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDish = async () => {
            if (!dishId) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const response = await userApi.getDishById(dishId);
                
                if (response.error) {
                    setError(response.error);
                } else if (response.data?.data) {
                    setDish(response.data.data);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch dish');
            } finally {
                setLoading(false);
            }
        };

        fetchDish();
    }, [dishId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#268700] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dish details...</p>
                </div>
            </div>
        );
    }

    if (error || !dish) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <div className="text-center max-w-md px-4">
                    <div className="mb-4">
                        <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">{error || 'Dish not found'}</p>
                    <p className="text-sm text-gray-600 mb-6">The dish you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#268700] text-white rounded-lg hover:bg-[#1f6b00] transition-colors font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    const currency = dish.currency || 'AED';

    return (
        <section className="bg-[#FAFAFA] min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
                >
                    <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="font-medium">Back to Menu</span>
                </button>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* LEFT: Image Section */}
                        <div className="relative h-[400px] lg:h-[600px] bg-gray-100">
                            <Image
                                src={dish.image_url || '/default_dish.jpg'}
                                alt={dish.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                                    dish.is_active 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-red-500 text-white'
                                }`}>
                                    {dish.is_active ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                        </div>

                        {/* RIGHT: Content Section */}
                        <div className="p-8 lg:p-12 flex flex-col justify-between">
                            <div>
                                {/* Title */}
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                    {dish.name}
                                </h1>

                                {/* Categories */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                                        {dish.cuisine_type.name}
                                    </span>
                                    <span className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                                        {dish.category.name}
                                    </span>
                                    {dish.sub_category && (
                                        <span className="px-4 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                                            {dish.sub_category.name}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                {dish.category.description && (
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        {dish.category.description}
                                    </p>
                                )}

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                                    {dish.quantity_in_gm && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Quantity</p>
                                            <p className="text-lg font-semibold text-gray-900">{dish.quantity_in_gm} gm</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pieces</p>
                                        <p className="text-lg font-semibold text-gray-900">{dish.pieces}</p>
                                    </div>
                                </div>

                                {/* Free Forms */}
                                {dish.free_forms && dish.free_forms.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Free Forms</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {dish.free_forms.map((freeForm) => (
                                                <span
                                                    key={freeForm.id}
                                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                                                >
                                                    {freeForm.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Caterer Info */}
                                {dish.caterer && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Prepared by</p>
                                        <p className="text-lg font-semibold text-gray-900 mb-1">{dish.caterer.name}</p>
                                        {dish.caterer.location && (
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {dish.caterer.location}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Bottom Section: Price and CTA */}
                            <div className="border-t pt-6 mt-6">
                                <div className="flex items-baseline justify-between mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Price</p>
                                        <p className="text-4xl font-bold text-gray-900">
                                            {currency} {dish.price.toLocaleString()}
                                        </p>
                                        {dish.quantity_in_gm && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                per {dish.quantity_in_gm}gm
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* View Caterer Profile Button */}
                                {dish.caterer && (
                                    <button
                                        onClick={() => router.push(`/user/caterers/${dish.caterer!.id}`)}
                                        className="w-full bg-[#268700] text-white py-4 rounded-xl hover:bg-[#1f6b00] transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        View Caterer Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
