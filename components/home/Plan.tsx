'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Plan() {
    const router = useRouter();

    const [form, setForm] = useState({
        eventType: 'Bakery',
        date: '',
        location: '',
        guests: '120',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Navigate with filters to packages page
        router.push(
            `/packages?eventType=${form.eventType}&date=${form.date}&location=${form.location}&guests=${form.guests}`
        );
    };

    return (
        <section className="min-h-[70vh] bg-gradient-to-br from-[#0b0a2a] via-[#0d0b35] to-[#09081f] text-white flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
                <h1 className="text-4xl md:text-5xl font-semibold mb-3">
                    Plan your Party In a Single Click
                </h1>
                <p className="text-gray-400 mb-10">
                    Fill the Form and Browse Packages
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end"
                >
                    {/* Event Type */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Event Type
                        </label>
                        <select
                            name="eventType"
                            value={form.eventType}
                            onChange={handleChange}
                            className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1ee87a]"
                        >
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
                            value={form.date}
                            onChange={handleChange}
                            className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1ee87a]"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Location
                        </label>
                        <select
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1ee87a] appearance-none cursor-pointer"
                            size={1}
                        >
                            <option value="" className="text-black bg-white">Select Location</option>
                            <option value="Dubai Marina" className="text-black bg-white">Dubai Marina</option>
                            <option value="Palm Jumeirah" className="text-black bg-white">Palm Jumeirah</option>
                            <option value="Downtown Dubai" className="text-black bg-white">Downtown Dubai</option>
                            <option value="JBR (Jumeirah Beach Residence)" className="text-black bg-white">JBR (Jumeirah Beach Residence)</option>
                            <option value="Business Bay" className="text-black bg-white">Business Bay</option>
                            <option value="Dubai International Financial Centre (DIFC)" className="text-black bg-white">Dubai International Financial Centre (DIFC)</option>
                            <option value="Dubai Media City" className="text-black bg-white">Dubai Media City</option>
                            <option value="Dubai Internet City" className="text-black bg-white">Dubai Internet City</option>
                            <option value="Dubai Knowledge Park" className="text-black bg-white">Dubai Knowledge Park</option>
                            <option value="Dubai Hills Estate" className="text-black bg-white">Dubai Hills Estate</option>
                            <option value="Emirates Hills" className="text-black bg-white">Emirates Hills</option>
                            <option value="Jumeirah" className="text-black bg-white">Jumeirah</option>
                            <option value="Umm Suqeim" className="text-black bg-white">Umm Suqeim</option>
                            <option value="Al Barsha" className="text-black bg-white">Al Barsha</option>
                            <option value="Al Quoz" className="text-black bg-white">Al Quoz</option>
                            <option value="Deira" className="text-black bg-white">Deira</option>
                            <option value="Bur Dubai" className="text-black bg-white">Bur Dubai</option>
                            <option value="Dubai Creek" className="text-black bg-white">Dubai Creek</option>
                            <option value="Dubai Silicon Oasis" className="text-black bg-white">Dubai Silicon Oasis</option>
                            <option value="Academic City" className="text-black bg-white">Academic City</option>
                            <option value="Dubai Sports City" className="text-black bg-white">Dubai Sports City</option>
                            <option value="Dubai Production City (IMPZ)" className="text-black bg-white">Dubai Production City (IMPZ)</option>
                            <option value="Dubai Studio City" className="text-black bg-white">Dubai Studio City</option>
                            <option value="Dubai Motor City" className="text-black bg-white">Dubai Motor City</option>
                            <option value="Dubai Investment Park" className="text-black bg-white">Dubai Investment Park</option>
                            <option value="Dubai Healthcare City" className="text-black bg-white">Dubai Healthcare City</option>
                            <option value="Dubai Festival City" className="text-black bg-white">Dubai Festival City</option>
                            <option value="Dubai Marina Walk" className="text-black bg-white">Dubai Marina Walk</option>
                            <option value="Bluewaters Island" className="text-black bg-white">Bluewaters Island</option>
                            <option value="Dubai World Trade Centre" className="text-black bg-white">Dubai World Trade Centre</option>
                            <option value="Dubai International City" className="text-black bg-white">Dubai International City</option>
                        </select>
                    </div>

                    {/* Guests */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Guests
                        </label>
                        <select
                            name="guests"
                            value={form.guests}
                            onChange={handleChange}
                            className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1ee87a]"
                        >
                            <option className="text-black">20</option>
                            <option className="text-black">50</option>
                            <option className="text-black">100</option>
                            <option className="text-black">120</option>
                            <option className="text-black">200+</option>
                        </select>
                    </div>

                    {/* CTA */}
                    <div className="md:col-span-4 mt-6">
                        <button
                            type="submit"
                            className="bg-[#1ee87a] text-black font-medium px-10 py-3 rounded-full hover:opacity-90 transition"
                        >
                            Browse Packages
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
