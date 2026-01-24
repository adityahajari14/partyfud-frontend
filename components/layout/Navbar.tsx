'use client';


import Link from 'next/link';
import { MapPin, Mail, User, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { userApi } from '@/lib/api/user.api';
import { cartStorage } from '@/lib/utils/cartStorage';

// Main Navbar component for the application
export function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
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
                // For non-authenticated users, get count from localStorage
                const localItems = cartStorage.getItems();
                setCartItemCount(localItems.length);
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

        // Listen for storage events (when cart is updated in another tab/window)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'partyfud_cart_items') {
                fetchCartCount();
            }
        };

        // Listen for custom cart update events (when cart is updated in same tab)
        const handleCartUpdate = () => {
            fetchCartCount();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('cartUpdated', handleCartUpdate);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, [user]);

    return (
        <header className="w-full">
            {/* Main Navbar */}
            <div className="bg-white border-b border-gray-200 px-8 py-2 flex items-center justify-between relative">
                {/* Left - Logo */}
                <div className="flex items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo_partyfud.svg"
                            alt="PartyFud Logo"
                            width={100}
                            height={100}
                        />
                    </Link>
                </div>

                {/* Center - Nav Links */}
                <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
                    <Link
                        href="/"
                        className={`text-sm font-medium transition-colors duration-200 py-2 ${pathname === '/'
                            ? 'text-[#268700] font-semibold'
                            : 'text-gray-700 hover:text-[#268700]'
                            }`}
                    >
                        Home
                    </Link>
                    <Link
                        href="/packages"
                        className={`text-sm font-medium transition-colors duration-200 py-2 ${pathname === '/packages' || pathname?.startsWith('/packages/')
                                ? 'text-[#268700] font-semibold'
                                : 'text-gray-700 hover:text-[#268700]'
                            }`}
                    >
                        Packages
                    </Link>
                    <Link
                        href="/caterers"
                        className={`text-sm font-medium transition-colors duration-200 py-2 ${pathname === '/caterers' || pathname?.startsWith('/caterers/')
                            ? 'text-[#268700] font-semibold'
                            : 'text-gray-700 hover:text-[#268700]'
                            }`}
                    >
                        Browse Caterers
                    </Link>
                    <Link
                        href="/for-caterers"
                        className={`text-sm font-medium transition-colors duration-200 py-2 ${pathname === '/for-caterers'
                            ? 'text-[#268700] font-semibold'
                            : 'text-gray-700 hover:text-[#268700]'
                            }`}
                    >
                        For Caterers
                    </Link>
                </nav>

                {/* Right Section (Icons + User + Actions) */}
                <div className="flex items-center gap-4 ml-auto">
                    <Link
                        href="/cart"
                        className="relative text-gray-600 hover:text-[#268700] transition-colors"
                    >
                        <ShoppingCart size={20} className="cursor-pointer" />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#268700] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                                {cartItemCount > 9 ? '9+' : cartItemCount}
                            </span>
                        )}
                    </Link>
                    {/* <Mail className="text-gray-600 cursor-pointer hover:text-[#268700] transition-colors" size={20} /> */}

                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-8 h-8 rounded-full bg-[#268700] flex items-center justify-center cursor-pointer hover:bg-[#1f6b00] transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <span className="text-white font-semibold text-sm">
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
                                                className="block w-full text-left px-4 py-2.5 text-sm font-medium text-[#268700] bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                    </svg>
                                                    Caterer Dashboard
                                                </span>
                                            </Link>
                                        )}
                                        {user.type === 'ADMIN' && (
                                            <Link
                                                href="/admin/dashboard"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="block w-full text-left px-4 py-2.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Admin Dashboard
                                                </span>
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
                            className="group flex items-center gap-2 text-gray-700 hover:text-[#268700] transition-all duration-200 font-bold py-1.5 px-3 rounded-xl hover:bg-gray-50 active:scale-95"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#268700]/10 group-hover:text-[#268700] transition-colors">
                                <User size={16} />
                            </div>
                            <span className="text-sm whitespace-nowrap tracking-tight">Sign In</span>
                        </Link>
                    )}

                    <Link
                        href="/onboarding"
                        className="bg-[#268700] text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-[#1f6b00] transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(38,135,0,0.3)] hover:shadow-[0_15px_25px_-10px_rgba(38,135,0,0.4)] active:scale-95"
                    >
                        Partner with Us
                    </Link>
                </div>
            </div>
        </header>
    );
}
