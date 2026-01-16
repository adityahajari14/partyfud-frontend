'use client';
// Build sync: Suspense wrapped

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
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
        // Check if profile is completed, if not redirect to details page
        if (user.profile_completed === false) {
          router.replace('/caterer/details');
        } else {
          router.replace('/caterer/dashboard');
        }
      } else if (user.type === 'USER') {
        router.replace(redirect || '/');
      } else if (user.type === 'ADMIN') {
        router.replace('/admin/dashboard');
      }
    }
  }, [user, authLoading, router, redirect]);

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
      } else if (result.user) {
        // Success - redirect immediately based on user data from login response
        const loggedInUser = result.user;

        if (loggedInUser.type === 'CATERER') {
          // Check if profile is completed, if not redirect to details page immediately
          if (loggedInUser.profile_completed === false) {
            router.replace('/caterer/details');
          } else {
            router.replace('/caterer/dashboard');
          }
        } else if (loggedInUser.type === 'USER') {
          router.replace(redirect || '/');
        } else if (loggedInUser.type === 'ADMIN') {
          router.replace('/admin/dashboard');
        }
      } else {
        // Fallback: wait for user state to update via useEffect
        // The useEffect will handle redirect when user state updates
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Food Theme Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#268700] to-[#1f6b00] relative overflow-hidden">
        <Image src="/left_ui.svg" alt="Food Theme" fill className="object-cover" />
        <div className='absolute text-5xl text-white m-8 p-6'>Grow your catering <br></br>business with PartyFud</div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            {/* Mobile Logo */}
            <div className="flex justify-center mb-6">
              <Image src="/logo_partyfud.svg" alt="Party Fud Logo" width={128} height={40} />
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
                  <Link href={`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="font-semibold text-[#268700] hover:text-[#1f6b00]">
                    Sign up for free
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

