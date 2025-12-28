'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const userRef = useRef(user);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update ref when user changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Redirect if already logged in or after successful login
  useEffect(() => {
    if (user && !authLoading) {
      setIsLoading(false); // Reset loading when user is available
      
      // Redirect immediately based on user type
      if (user.type === 'CATERER') {
        router.replace('/caterer/dashboard');
      } else if (user.type === 'USER') {
        router.replace('/user/dashboard');
      } else if (user.type === 'ADMIN') {
        router.replace('/admin/dashboard');
      }
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.error) {
        // Ensure error is always a string
        setError(typeof result.error === 'string' ? result.error : String(result.error));
        setIsLoading(false);
      } else {
        // Success - the useEffect will handle redirect when user state updates
        // Just wait a moment for refreshUser to complete
        // The redirect will happen automatically via the useEffect above
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Food Theme Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#268700] to-[#1f6b00] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl">🍕</div>
          <div className="absolute top-32 right-20 text-5xl">🍔</div>
          <div className="absolute bottom-32 left-20 text-6xl">🍰</div>
          <div className="absolute bottom-20 right-10 text-5xl">🥗</div>
          <div className="absolute top-1/2 left-1/4 text-4xl">🍝</div>
          <div className="absolute top-1/3 right-1/3 text-5xl">🌮</div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
              <span className="text-white font-bold text-4xl">P</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">Party Fud</h1>
            <p className="text-xl text-white/90 max-w-md text-center">
              Your one-stop destination for delicious party catering. Connect with the best caterers and make your events memorable.
            </p>
          </div>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Premium Catering Services</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Easy Package Management</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Trusted by Thousands</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#268700] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
          </div>

          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
              Welcome Back!
            </h2>
            <p className="text-center text-base text-gray-600">
              Sign in to continue to Party Fud
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md shadow-sm">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <Input
                label="Email address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
              <Input
                label="Password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#268700] focus:ring-[#268700] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="#" className="font-medium text-[#268700] hover:text-[#1f6b00]">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <Button type="submit" variant="primary" className="w-full py-3 text-base font-semibold" isLoading={isLoading}>
                Sign in
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="font-semibold text-[#268700] hover:text-[#1f6b00]">
                  Sign up for free
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

