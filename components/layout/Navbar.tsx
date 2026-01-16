'use client';


import Link from 'next/link';
import { MapPin, Mail, User, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { userApi } from '@/lib/api/user.api';

// Main Navbar component for the application
export function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        setIsDropdownOpen(false);
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Fetch cart item count
    useEffect(() => {
        const fetchCartCount = async () => {
            if (!user) {
                setCartItemCount(0);
                return;
            }

            try {
                const response = await userApi.getCartItems();
                if (response.data?.data && Array.isArray(response.data.data)) {
                    setCartItemCount(response.data.data.length);
                }
            } catch (err) {
                console.error('Error fetching cart count:', err);
            }
        };

        fetchCartCount();

        // Refresh cart count periodically (every 5 seconds)
        const interval = setInterval(fetchCartCount, 5000);

        return () => clearInterval(interval);
    }, [user]);

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
            <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between relative">
                {/* Left - Logo */}
                <div className="flex items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo_partyfud.svg"
                            alt="PartyFud Logo"
                            width={120}
                            height={120}
                        />
                    </Link>
                </div>

                {/* Center - Nav Links */}
                <nav className="hidden md:flex items-center gap-10 absolute left-1/2 transform -translate-x-1/2">
                    <Link
                        href="/"
                        className="text-base font-medium text-gray-700 hover:text-[#268700] transition-colors duration-200 py-2"
                    >
                        Home
                    </Link>
                    <Link
                        href="/menu"
                        className="text-base font-medium text-gray-700 hover:text-[#268700] transition-colors duration-200 py-2"
                    >
                        Menu
                    </Link>
                    <Link
                        href="/packages"
                        className="text-base font-medium text-gray-700 hover:text-[#268700] transition-colors duration-200 py-2"
                    >
                        Packages
                    </Link>
                    <Link
                        href="/caterers"
                        className="text-base font-medium text-gray-700 hover:text-[#268700] transition-colors duration-200 py-2"
                    >
                        Caterers
                    </Link>
                </nav>

                {/* Right Section (Icons + User + Actions) */}
                <div className="flex items-center gap-5 ml-auto">
                    <Link
                        href="/cart"
                        className="relative text-gray-600 hover:text-[#268700] transition-colors"
                    >
                        <ShoppingCart size={22} className="cursor-pointer" />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#268700] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                                {cartItemCount > 9 ? '9+' : cartItemCount}
                            </span>
                        )}
                    </Link>
                    {/* <Mail className="text-gray-600 cursor-pointer hover:text-[#268700] transition-colors" size={22} /> */}

                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-10 h-10 rounded-full bg-[#268700] flex items-center justify-center cursor-pointer hover:bg-[#1f6b00] transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <span className="text-white font-semibold">
                                    {user.first_name?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-3 z-50">
                                    <div className="px-5 py-3 border-b border-gray-200">
                                        <p className="text-base font-medium text-gray-900">
                                            Hey {user.first_name || 'User'}
                                        </p>
                                    </div>
                                    <div className="px-3 py-2 space-y-2">
                                        {user.type === 'CATERER' && (
                                            <Link
                                                href="/caterer/dashboard"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                            >
                                                Dashboard
                                            </Link>
                                        )}
                                        <Link
                                            href="/orders"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                        >
                                            My Orders
                                        </Link>
                                        <Link
                                            href="/mypackages"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                        >
                                            My Packages
                                        </Link>
                                        <Link
                                            href="/proposals"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                        >
                                            My Proposals
                                        </Link>
                                        <Button
                                            onClick={handleLogout}
                                            variant="primary"
                                            size="md"
                                            isLoading={isLoggingOut}
                                            className="w-full"
                                        >
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="group flex items-center gap-2 text-gray-700 hover:text-[#268700] transition-all duration-200 font-bold py-2 px-3 rounded-xl hover:bg-gray-50 active:scale-95"
                        >
                            <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#268700]/10 group-hover:text-[#268700] transition-colors">
                                <User size={18} />
                            </div>
                            <span className="text-sm whitespace-nowrap tracking-tight">Sign In</span>
                        </Link>
                    )}

                    <Link
                        href="/onboarding"
                        className="bg-[#268700] text-white text-[11px] font-black uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-[#1f6b00] transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(38,135,0,0.3)] hover:shadow-[0_15px_25px_-10px_rgba(38,135,0,0.4)] active:scale-95"
                    >
                        Partner with Us
                    </Link>
                </div>
            </div>
        </header>
    );
}
