'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { userApi, Dish, type Occasion } from '@/lib/api/user.api';
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    MapPin,
    Users,
    Info,
    Check,
    Truck,
    Clock,
    Star
} from 'lucide-react';

export default function DishDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const dishId = params.id as string;

    const [dish, setDish] = useState<Dish | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [occasions, setOccasions] = useState<Occasion[]>([]);

    // Event Details State
    const [selectedEventType, setSelectedEventType] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [guestCount, setGuestCount] = useState<number>(20);
    const [eventDate, setEventDate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!dishId) return;

            setLoading(true);
            setError(null);

            try {
                const [dishRes, occasionsRes] = await Promise.all([
                    userApi.getDishById(dishId),
                    userApi.getOccasions()
                ]);

                if (dishRes.error) {
                    setError(dishRes.error);
                } else if (dishRes.data?.data) {
                    setDish(dishRes.data.data);
                }

                if (occasionsRes.data?.data) {
                    setOccasions(occasionsRes.data.data);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch dish');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dishId]);

    const handleViewPackages = () => {
        // Redirect to packages page with occasion and dish filters
        let url = `/user/packages?dish_id=${dishId}`;
        if (selectedEventType) {
            url += `&occasion_id=${selectedEventType}`;
        }
        router.push(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#268700] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">Loading Details...</p>
                </div>
            </div>
        );
    }

    if (error || !dish) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <div className="text-center max-w-md px-4">
                    <div className="mb-4">
                        <Info className="w-16 h-16 text-gray-400 mx-auto" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">{error || 'Dish not found'}</p>
                    <p className="text-sm text-gray-600 mb-6">The dish you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#268700] text-white rounded-xl hover:bg-[#1f6b00] transition-colors font-bold"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    const currency = dish.currency || 'AED';

    return (
        <section className="bg-white min-h-screen flex flex-col relative pb-32">
            {/* Header - Simple */}
            <div className="max-w-[700px] w-full mx-auto px-6 pt-8 pb-2">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group font-black text-[10px] uppercase tracking-[0.2em]"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Back to Menu</span>
                </button>
            </div>

            {/* Main Content Area - Unified Single Card */}
            <div className="max-w-[700px] w-full mx-auto px-6">
                <div className="bg-gray-50/80 rounded-[2.5rem] border border-gray-200/60 p-6 flex flex-col gap-6 shadow-sm">

                    {/* 1. Image & Header Group */}
                    <div className="flex flex-col gap-4">
                        <div className="relative h-[240px] w-full bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-white">
                            <Image
                                src={dish.image_url || '/default_dish.jpg'}
                                alt={dish.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute top-4 right-4 text-xs font-black">
                                <span className={`px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg ${dish.is_active ? 'bg-[#268700] text-white' : 'bg-red-500 text-white'
                                    }`}>
                                    {dish.is_active ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                        </div>

                        <div className="px-2">
                            <div className="flex flex-wrap gap-2 text-[9px] mb-2">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-black uppercase tracking-widest border border-blue-100">
                                    {dish.cuisine_type.name}
                                </span>
                                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full font-black uppercase tracking-widest border border-green-100">
                                    {dish.category.name}
                                </span>
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 mb-1 leading-tight tracking-tight">
                                {dish.name}
                            </h1>
                            {dish.category.description && (
                                <p className="text-gray-500 text-sm leading-relaxed font-medium italic">
                                    {dish.category.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 2. Content Matrix (Metrics & Caterer) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-3">
                            <div className="flex-1 px-4 py-3 bg-white rounded-2xl border border-gray-100 text-center shadow-sm">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Pieces</p>
                                <p className="text-xl font-black text-gray-900 leading-none">{dish.pieces}</p>
                            </div>
                            {dish.quantity_in_gm && (
                                <div className="flex-1 px-4 py-3 bg-white rounded-2xl border border-gray-100 text-center shadow-sm">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Weight</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <p className="text-xl font-black text-gray-900 leading-none">{dish.quantity_in_gm}</p>
                                        <span className="text-[10px] font-black text-gray-400">g</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {dish.caterer && (
                            <div className="px-4 py-3 bg-white rounded-2xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
                                onClick={() => router.push(`/user/caterers/${dish.caterer?.id}`)}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-[#268700]" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Caterer</p>
                                        <p className="text-sm font-black text-gray-900 truncate max-w-[120px]">{dish.caterer.name}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#268700] transition-transform group-hover:translate-x-0.5" />
                            </div>
                        )}
                    </div>

                    {/* 3. Event Details Form - Compact */}
                    <div className="pt-4 border-t border-gray-200/60">
                        <h2 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                            <Calendar className="w-4 h-4 text-[#268700]" />
                            Event Details
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Event Type</label>
                                <select
                                    value={selectedEventType}
                                    onChange={(e) => setSelectedEventType(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-black focus:outline-none focus:border-[#268700] transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Event Type</option>
                                    {occasions.map((occ) => (
                                        <option key={occ.id} value={occ.id}>{occ.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <select
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-black focus:outline-none focus:border-[#268700] transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Location</option>
                                        <option value="Dubai Marina">Dubai Marina</option>
                                        <option value="Downtown">Downtown</option>
                                        <option value="JLT">JLT</option>
                                        <option value="Palm Jumeirah">Palm Jumeirah</option>
                                        <option value="UAE Wide">UAE Wide</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Guests</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input
                                        type="number"
                                        value={guestCount}
                                        onChange={(e) => setGuestCount(parseInt(e.target.value))}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-black focus:outline-none focus:border-[#268700] transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        className="w-full pl-10 pr-1 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-black focus:outline-none focus:border-[#268700] transition-all cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-gray-100 shadow-[0_-5px_30px_rgba(0,0,0,0.03)] px-6 py-4 z-50 backdrop-blur-md">
                <div className="max-w-[700px] mx-auto flex items-center justify-between gap-8">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Starting Price</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-black text-gray-900">AED</span>
                            <span className="text-3xl font-black text-[#2EB400] leading-none tracking-tighter">{dish.price.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-gray-400 ml-1">/ person</span>
                        </div>
                    </div>

                    <button
                        onClick={handleViewPackages}
                        className="bg-[#2EB400] text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#268700] transition-all shadow-lg active:scale-95 flex items-center gap-3 group"
                    >
                        View Packages
                        <ChevronRight className="w-4 h-4 stroke-[3]" />
                    </button>
                </div>
            </div>
        </section>
    );
}
