'use client';

import Link from 'next/link';
import { MapPin, Mail, User } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            // Redirect to login page after logout
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if there's an error, redirect to login
            router.push('/login');
        } finally {
            setIsLoggingOut(false);
        }
    };

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
            {/* Main Navbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo_partyfud.svg"
                            alt="PartyFud Logo"
                            width={100}
                            height={100}
                        />
                    </Link>

                    {/* Currency */}
                    <select className="border border-gray-300 rounded-md px-2 py-1 text-sm">
                        <option>AED</option>
                        <option>INR</option>
                        <option>USD</option>
                    </select>
                </div>

                {/* Right Section (Nav + User + Actions) */}
                <div className="flex items-center gap-8">
                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
                        <Link href="/user/home" className="hover:text-black">
                            Home
                        </Link>
                        <Link href="/user/occasions" className="hover:text-black">
                            Occasions
                        </Link>
                        <Link href="/user/menu" className="hover:text-black">
                            Menu
                        </Link>
                        <Link href="/user/caterers" className="hover:text-black">
                            Caterers
                        </Link>
                    </nav>

                    {/* Icons + User */}
                    <div className="flex items-center gap-4">
                        <Mail className="text-gray-600 cursor-pointer" size={20} />

                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-700">
                                    Hello, {user.first_name || 'User'}
                                </span>

                                <div className="w-9 h-9 rounded-full bg-[#59c226] flex items-center justify-center">
                                    <span className="text-white font-semibold">
                                        {user.first_name?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                </div>

                                <Button
                                    onClick={handleLogout}
                                    variant="primary"
                                    size="md"
                                    isLoading={isLoggingOut}
                                >
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <User className="text-gray-600 cursor-pointer" size={20} />
                        )}

                        <button className="bg-[#59c226] text-white text-sm font-medium px-4 py-2 rounded-full hover:opacity-90 transition">
                            Partner with Us
                        </button>
                    </div>
                </div>
            </div>

        </header>
    );
}
