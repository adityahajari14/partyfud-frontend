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
        <section className="bg-[#FAFAFA] min-h-screen flex flex-col relative pb-32">
            {/* Header - Simple & Clean */}
            <div className="max-w-[800px] w-full mx-auto px-6 py-6 pb-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group font-black text-[11px] uppercase tracking-[0.2em]"
                >
                    <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span>Back to Menu</span>
                </button>
            </div>

            {/* Main Content Area - Vertical Stack */}
            <div className="max-w-[800px] w-full mx-auto px-6 flex flex-col gap-8">

                {/* 1. Image Row */}
                <div className="relative h-[350px] w-full bg-white rounded-[2rem] overflow-hidden shadow-xl border border-white/50">
                    <Image
                        src={dish.image_url || '/default_dish.jpg'}
                        alt={dish.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute top-6 right-6">
                        <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-md ${dish.is_active
                                ? 'bg-[#268700]/95 text-white'
                                : 'bg-red-500/95 text-white'
                            }`}>
                            {dish.is_active ? 'Available' : 'Unavailable'}
                        </span>
                    </div>
                </div>

                {/* 2. Dish Details Row */}
                <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 flex flex-col gap-8">
                    <div>
                        <div className="flex flex-wrap gap-2 text-[10px] mb-4">
                            <span className="px-5 py-2 bg-blue-50 text-blue-600 rounded-full font-black uppercase tracking-widest border border-blue-100 italic">
                                {dish.cuisine_type.name}
                            </span>
                            <span className="px-5 py-2 bg-green-50 text-green-600 rounded-full font-black uppercase tracking-widest border border-green-100 italic">
                                {dish.category.name}
                            </span>
                        </div>

                        <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight tracking-tight">
                            {dish.name}
                        </h1>

                        {dish.category.description && (
                            <p className="text-gray-500 text-lg leading-relaxed font-medium">
                                {dish.category.description}
                            </p>
                        )}
                    </div>

                    {/* Metrics Row */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[140px] px-6 py-5 bg-gray-50/50 rounded-2xl border border-gray-100 text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Pieces</p>
                            <p className="text-3xl font-black text-gray-900 leading-none">{dish.pieces}</p>
                        </div>
                        {dish.quantity_in_gm && (
                            <div className="flex-1 min-w-[160px] px-6 py-5 bg-gray-50/50 rounded-2xl border border-gray-100 text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Weight</p>
                                <div className="flex items-baseline justify-center gap-1.5">
                                    <p className="text-3xl font-black text-gray-900 leading-none">{dish.quantity_in_gm}</p>
                                    <span className="text-sm font-black text-gray-400 uppercase">g</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Caterer Row */}
                    {dish.caterer && (
                        <div className="p-6 bg-white rounded-[1.5rem] border border-gray-100 flex items-center justify-between group cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
                            onClick={() => router.push(`/user/caterers/${dish.caterer?.id}`)}>
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                                    <MapPin className="w-7 h-7 text-[#268700]" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] leading-none mb-1.5">Prepared by</p>
                                    <p className="text-xl font-black text-gray-900">{dish.caterer.name}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-[#268700] transition-transform group-hover:translate-x-1" />
                        </div>
                    )}
                </div>

                {/* 3. Event Details Form Row */}
                <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 underline decoration-green-500/30 underline-offset-8">
                        <Calendar className="w-7 h-7 text-[#268700]" />
                        Event Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1 text-center md:text-left">Event Type *</label>
                            <select
                                value={selectedEventType}
                                onChange={(e) => setSelectedEventType(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent text-base font-black focus:outline-none focus:border-[#268700] focus:bg-white transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Select Event Type</option>
                                {occasions.map((occ) => (
                                    <option key={occ.id} value={occ.id}>{occ.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1 text-center md:text-left">Location *</label>
                            <div className="relative">
                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent text-base font-black focus:outline-none focus:border-[#268700] focus:bg-white transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Location</option>
                                    <option value="Dubai Marina">Dubai Marina</option>
                                    <option value="Downtown Dubai">Downtown Dubai</option>
                                    <option value="JLT">JLT</option>
                                    <option value="Palm Jumeirah">Palm Jumeirah</option>
                                    <option value="All over UAE">All over UAE</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1 text-center md:text-left">Guests *</label>
                            <div className="relative">
                                <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    value={guestCount}
                                    onChange={(e) => setGuestCount(parseInt(e.target.value))}
                                    min="1"
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent text-base font-black focus:outline-none focus:border-[#268700] focus:bg-white transition-all text-center md:text-left"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1 text-center md:text-left">Date *</label>
                            <div className="relative">
                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="w-full pl-14 pr-4 py-4 rounded-2xl bg-gray-50 border border-transparent text-base font-black focus:outline-none focus:border-[#268700] focus:bg-white transition-all text-center md:text-left"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-50 text-center">
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                            <span className="w-8 h-px bg-gray-100"></span>
                            Secure your booking now
                            <span className="w-8 h-px bg-gray-100"></span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Bar - Clean & Centered */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] px-8 py-5 z-50 backdrop-blur-md">
                <div className="max-w-[1000px] mx-auto flex items-center justify-between gap-12">
                    <div className="flex flex-col shrink-0">
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1.5">Starting Price</span>
                        <div className="flex items-baseline gap-2.5">
                            <span className="text-base font-black text-gray-900 tracking-tight">AED</span>
                            <span className="text-5xl font-black text-gray-900 tracking-tighter leading-none lowercase text-[#2EB400]">{dish.price.toLocaleString()}</span>
                            <span className="text-sm font-bold text-gray-400 ml-2">/ person</span>
                        </div>
                    </div>

                    <button
                        onClick={handleViewPackages}
                        className="bg-[#2EB400] text-white px-14 py-5 rounded-2xl font-black text-base uppercase tracking-[0.25em] hover:bg-[#268700] transition-all shadow-xl shadow-green-100 active:scale-95 flex items-center gap-4 group flex-1 max-w-[500px] justify-center"
                    >
                        View Menu Package
                        <ChevronRight className="w-7 h-7 stroke-[3] transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </section>
    );
}
