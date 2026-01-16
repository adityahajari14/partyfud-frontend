'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, ChevronDown } from 'lucide-react';
import { userApi } from '@/lib/api/user.api';

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
        
        // Navigate to packages page with filters
        const queryString = params.toString();
        router.push(`/packages${queryString ? `?${queryString}` : ''}`);
    };

    return(
<section className="relative bg-[#FAFAFA] overflow-hidden">
            <div className="max-w-8xl mx-auto px-18 pt-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* LEFT CONTENT */}
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight text-black">
                            Plan Any Event.
                            <br />
                            <span className="text-[#268700]">Order Any Food.</span>
                        </h1>

                        <p className="mt-6 text-gray-600 max-w-xl text-lg leading-relaxed">
                            UAE&apos;s first dedicated catering marketplace. From canapés to
                            private chefs — discover trusted caterers across Dubai, Abu Dhabi
                            & beyond.
                        </p>

                        {/* Search/Booking Form */}
                        <form onSubmit={handlePlanEvent} className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 md:p-7 shadow-xl shadow-gray-900/5 backdrop-blur-sm">
                            <div className="grid grid-cols-2 gap-4 mb-5">
                                {/* Event Type */}
                                <div className="relative group">
                                    <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide uppercase">Event Type</label>
                                    <div className="relative">
                                        <select
                                            name="eventType"
                                            value={eventType}
                                            onChange={(e) => setEventType(e.target.value)}
                                            className="w-full bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3.5 pr-10 text-sm font-medium appearance-none transition-all duration-200 focus:outline-none focus:border-[#268700] focus:bg-white focus:ring-4 focus:ring-[#268700]/10 text-gray-900 hover:border-gray-300 cursor-pointer"
                                            disabled={loadingTypes}
                                        >
                                            <option value="" className="text-gray-400">Select event</option>
                                            {occasions.map((occasion) => (
                                                <option key={occasion.id} value={occasion.name}>
                                                    {occasion.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" size={18} />
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="relative group">
                                    <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide uppercase">Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3.5 pl-11 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-[#268700] focus:bg-white focus:ring-4 focus:ring-[#268700]/10 text-gray-900 hover:border-gray-300 cursor-pointer"
                                            placeholder="dd-mm-yyyy"
                                        />
                                        <Calendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" size={18} />
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="relative group">
                                    <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide uppercase">Location</label>
                                    <div className="relative">
                                        <select
                                            name="location"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3.5 pl-11 pr-10 text-sm font-medium appearance-none transition-all duration-200 focus:outline-none focus:border-[#268700] focus:bg-white focus:ring-4 focus:ring-[#268700]/10 text-gray-900 hover:border-gray-300 cursor-pointer"
                                        >
                                            <option value="" className="text-gray-400">Dubai, Abu Dh</option>
                                            <option value="Downtown Dubai" className="text-gray-900">Downtown Dubai</option>
                                            <option value="Dubai Marina" className="text-gray-900">Dubai Marina</option>
                                            <option value="Jumeirah" className="text-gray-900">Jumeirah</option>
                                            <option value="Palm Jumeirah" className="text-gray-900">Palm Jumeirah</option>
                                            <option value="Business Bay" className="text-gray-900">Business Bay</option>
                                            <option value="Dubai International Financial Centre (DIFC)" className="text-gray-900">Dubai International Financial Centre (DIFC)</option>
                                            <option value="Dubai Mall Area" className="text-gray-900">Dubai Mall Area</option>
                                            <option value="Burj Al Arab Area" className="text-gray-900">Burj Al Arab Area</option>
                                            <option value="Dubai Festival City" className="text-gray-900">Dubai Festival City</option>
                                            <option value="Dubai Sports City" className="text-gray-900">Dubai Sports City</option>
                                            <option value="Dubai Media City" className="text-gray-900">Dubai Media City</option>
                                            <option value="Dubai Internet City" className="text-gray-900">Dubai Internet City</option>
                                            <option value="Dubai Knowledge Park" className="text-gray-900">Dubai Knowledge Park</option>
                                            <option value="Dubai Healthcare City" className="text-gray-900">Dubai Healthcare City</option>
                                            <option value="Dubai World Trade Centre" className="text-gray-900">Dubai World Trade Centre</option>
                                            <option value="Dubai Creek" className="text-gray-900">Dubai Creek</option>
                                            <option value="Deira" className="text-gray-900">Deira</option>
                                            <option value="Bur Dubai" className="text-gray-900">Bur Dubai</option>
                                            <option value="Al Barsha" className="text-gray-900">Al Barsha</option>
                                            <option value="Jumeirah Beach Residence (JBR)" className="text-gray-900">Jumeirah Beach Residence (JBR)</option>
                                            <option value="Dubai Hills" className="text-gray-900">Dubai Hills</option>
                                            <option value="Arabian Ranches" className="text-gray-900">Arabian Ranches</option>
                                            <option value="Emirates Hills" className="text-gray-900">Emirates Hills</option>
                                            <option value="Dubai Silicon Oasis" className="text-gray-900">Dubai Silicon Oasis</option>
                                            <option value="Dubai Production City" className="text-gray-900">Dubai Production City</option>
                                            <option value="Dubai Studio City" className="text-gray-900">Dubai Studio City</option>
                                        </select>
                                        <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" size={18} />
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" size={18} />
                                    </div>
                                </div>

                                {/* Guests */}
                                <div className="relative group">
                                    <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide uppercase">Guests</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="guests"
                                            value={guests}
                                            onChange={(e) => setGuests(e.target.value ? parseInt(e.target.value, 10) : '')}
                                            className="w-full bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3.5 pl-11 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-[#268700] focus:bg-white focus:ring-4 focus:ring-[#268700]/10 text-gray-900 hover:border-gray-300 placeholder:text-gray-400"
                                            placeholder="Number"
                                            min="1"
                                        />
                                        <Users className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-[#268700] to-[#2da000] text-white px-8 py-4 rounded-xl text-sm font-bold hover:from-[#1f6b00] hover:to-[#268700] transition-all duration-200 shadow-lg shadow-[#268700]/25 hover:shadow-xl hover:shadow-[#268700]/30 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Plan Your Event
                                </button>
                                <Link
                                    href="/onboarding"
                                    className="px-8 py-4 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 whitespace-nowrap text-center hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Become a Caterer
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT IMAGES */}
                    <div className="relative flex justify-center lg:justify-end">

                        {/* Main Big Image */}
                        <div className="relative w-180 h-120 rounded-2xl overflow-hidden shadow-xl">
                            <Image
                                src="/user/user_dashboard_img1.svg"
                                alt="Catering food spread"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Floating Card – Top Right */}
                        <div className="absolute -top-6 -right-6 bg-white border border-gray-200 rounded-xl shadow-sm w-64 overflow-hidden">
                            <div className="relative h-32">
                                <Image
                                    src="/user/user_dashboard_img2.svg"
                                    alt="Veg New Year Brunch"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                                        Customisable
                                    </span>
                                    <span className="flex items-center gap-1 text-gray-600">
                                        ⭐ 4.5
                                    </span>
                                </div>
                                <p className="text-sm font-medium">Veg New Year Brunch</p>
                                <p className="text-xs text-gray-500">Al Sharib Caterers</p>
                            </div>
                        </div>

                        {/* Floating Card – Bottom */}
                        <div className="absolute -bottom-8 -left-10 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center gap-4 p-2 w-84">
                            <div className="w-22 h-14 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
                                AZIZ
                            </div>
                            <div>
                                <p className="font-medium text-sm">Aziz Caterers</p>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        Italian
                                    </span>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        Indian
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                    ⭐ 4.5
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
);
}