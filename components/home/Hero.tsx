'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, ChevronDown } from 'lucide-react';
import { userApi } from '@/lib/api/user.api';
import { UAE_EMIRATES } from '@/lib/constants';

interface Occasion {
    id: string;
    name: string;
    description?: string | null;
}

export default function Hero() {
    const router = useRouter();
    const [eventType, setEventType] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [guests, setGuests] = useState<number | ''>('');
    const [occasions, setOccasions] = useState<Occasion[]>([]);
    const [loadingTypes, setLoadingTypes] = useState(true);

    // Fetch occasions
    useEffect(() => {
        const fetchOccasions = async () => {
            setLoadingTypes(true);
            try {
                const response = await userApi.getOccasions();

                if (response.error) {
                    console.error('Failed to fetch occasions:', response.error);
                } else if (response.data?.data) {
                    setOccasions(response.data.data);
                }
            } catch (err) {
                console.error('Error fetching occasions:', err);
            } finally {
                setLoadingTypes(false);
            }
        };

        fetchOccasions();
    }, []);

    const handlePlanEvent = (e: React.FormEvent) => {
        e.preventDefault();

        // Build query parameters
        const params = new URLSearchParams();
        if (location) params.append('location', location);
        if (guests) params.append('min_guests', String(guests));
        if (date) params.append('date', date);

        // Navigate to caterers page with filters
        const queryString = params.toString();
        router.push(`/caterers${queryString ? `?${queryString}` : ''}`);
    };

    return (
        <section className="relative min-h-[600px] flex items-center">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero-img.webp"
                    alt="Hero Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 via-black/40 via-black/20 to-transparent" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-0">
                {/* Text Content */}
                <div className="max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
                        Plan Any Event.
                        <br />
                        <span className="text-[#64C042]">Order Any Food.</span>
                    </h1>

                    <p className="mt-6 text-gray-200 text-lg leading-relaxed max-w-2xl">
                        UAE&apos;s first dedicated catering marketplace. From canapés to
                        private chefs — discover trusted caterers across Dubai, Abu Dhabi
                        & beyond.
                    </p>
                </div>

                {/* Search/Booking Form */}
                <form onSubmit={handlePlanEvent} className="mt-10 bg-white rounded-lg shadow-xl p-6 w-full lg:w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {/* Event Type */}
                        <div className="relative group">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                Event Type
                            </label>
                            <div className="relative">
                                <select
                                    name="eventType"
                                    value={eventType}
                                    onChange={(e) => setEventType(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#64C042] focus:ring-1 focus:ring-[#64C042] appearance-none"
                                    disabled={loadingTypes}
                                >
                                    <option value="" className="text-gray-400">Select event</option>
                                    {occasions.map((occasion) => (
                                        <option key={occasion.id} value={occasion.name}>
                                            {occasion.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        {/* Date */}
                        <div className="relative group">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                Date
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 pl-10 text-sm text-gray-700 focus:outline-none focus:border-[#64C042] focus:ring-1 focus:ring-[#64C042]"
                                    placeholder="dd-mm-yyyy"
                                />
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="relative group">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                Location
                            </label>
                            <div className="relative">
                                <select
                                    name="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 pl-10 appearance-none text-sm text-gray-700 focus:outline-none focus:border-[#64C042] focus:ring-1 focus:ring-[#64C042]"
                                >
                                    <option value="" className="text-gray-400">Select Emirate</option>
                                    {UAE_EMIRATES.map((emirate) => (
                                        <option key={emirate} value={emirate}>
                                            {emirate}
                                        </option>
                                    ))}
                                </select>
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        {/* Guests */}
                        <div className="relative group">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                Guests
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="guests"
                                    value={guests}
                                    onChange={(e) => setGuests(e.target.value ? parseInt(e.target.value, 10) : '')}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 pl-10 text-sm text-gray-700 focus:outline-none focus:border-[#64C042] focus:ring-1 focus:ring-[#64C042] placeholder:text-gray-400"
                                    placeholder="Number"
                                    min="1"
                                />
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="submit"
                            className="flex-1 bg-[#64C042] text-white px-8 py-3 rounded-md text-sm font-bold hover:bg-[#53a635] transition-colors shadow-sm"
                        >
                            Plan Your Event
                        </button>
                        <Link
                            href="/onboarding"
                            className="flex-[0.4] flex items-center justify-center px-8 py-3 border border-gray-200 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                        >
                            Become a Caterer
                        </Link>
                    </div>
                </form>
            </div>
        </section>
    );
}