'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UAE_EMIRATES } from '@/lib/constants';

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

        // Navigate with filters to caterers page
        router.push(
            `/caterers?eventType=${form.eventType}&date=${form.date}&location=${form.location}&guests=${form.guests}`
        );
    };

    return (
        <section className="min-h-[70vh] bg-gradient-to-br from-[#0b0a2a] via-[#0d0b35] to-[#09081f] text-white flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
                <h1 className="text-4xl md:text-5xl font-semibold mb-3">
                    Plan your Party In a Single Click
                </h1>
                <p className="text-gray-400 mb-10">
                    Fill the Form and Browse Caterers
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
                            {UAE_EMIRATES.map((emirate) => (
                                <option key={emirate} value={emirate} className="text-black bg-white">
                                    {emirate}
                                </option>
                            ))}
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
                            Browse Caterers
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
