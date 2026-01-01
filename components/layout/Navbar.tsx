'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Mail, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header className="w-full">
            {/* Top Promo Bar */}
            <div className="bg-black text-white text-sm px-6 py-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                    ⭐ Get 5% Off your first order, Promo: <b>ORDERS</b>
                </span>

                <span className="flex items-center gap-1 text-gray-300">
                    <MapPin size={14} />
                    Palm Jumeirah, Dubai
                    <button className="ml-1 underline text-white">Change</button>
                </span>
            </div>

            {/* Main Navbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo_partyfud.svg" alt="PartyFud Logo" width={100} height={100} />
                    </Link>

                    {/* Currency */}
                    <select className="border border-gray-300 rounded-md px-2 py-1 text-sm">
                        <option>AED</option>
                        <option>INR</option>
                        <option>USD</option>
                    </select>
                </div>

                {/* Center Links */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
                    <Link href="/user/home" className="hover:text-black">Home</Link>
                    <Link href="/user/occasions" className="hover:text-black">Occasions</Link>
                    <Link href="/user/menu" className="hover:text-black">Menu</Link>
                    <Link href="/user/caterers" className="hover:text-black">Caterers</Link>
                </nav>

                {/* Right */}
                <div className="flex items-center gap-4">
                    <Mail className="text-gray-600 cursor-pointer" size={20} />

                    {/* User Section */}
                    {user ? (
                        <div className="flex items-center gap-3">
                            {/* Greeting */}
                            <span className="text-sm text-gray-700">
                                Hello, {user.first_name || 'User'}
                            </span>

                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-[#59c226] flex items-center justify-center">
                                <span className="text-white font-semibold">
                                    {user.first_name?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>

                            {/* Logout */}
                            <button
                                onClick={logout}
                                className="text-sm text-gray-600 hover:text-black transition"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <User className="text-gray-600 cursor-pointer" size={20} />
                    )}

                    <button className="bg-[#59c226] text-white text-sm font-medium px-4 py-2 rounded-full hover:opacity-90 transition">
                        Partner with Us
                    </button>
                </div>
            </div>
        </header>
    );
}
