'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [justSignedUp, setJustSignedUp] = useState(false);
  const { signup, user } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!user || justSignedUp) return;

    // If user is already logged in and navigates to signup page
    if (user.type === 'CATERER') {
      router.replace('/caterer/dashboard');
    } else if (user.type === 'USER') {
      router.replace('/');
    } else if (user.type === 'ADMIN') {
      router.replace('/admin/dashboard');
    }
  }, [user, justSignedUp, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);

    try {
      const signupData = {
        ...formData,
        type: 'USER', // All signups are USER by default, onboarding will change to CATERER
      };

      const result = await signup(signupData);

      if (result.error) {
        setError(String(result.error));
        setIsLoading(false);
      } else {
        setJustSignedUp(true);
        // If redirect is to onboarding, go there after signup
        // Otherwise go to homepage
        router.replace(redirect || '/');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side*/}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#268700] to-[#1f6b00] relative overflow-hidden">
        <Image src="/left_ui.svg" alt="Food Theme" fill className="object-cover" />
        <div className='absolute text-5xl text-white m-8 p-6'>Grow your catering <br></br>business with PartyFud</div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-md w-full space-y-6">
          {/* Mobile Logo */}
          <div className="flex justify-center mb-6">
            <Image src="/logo_partyfud.svg" alt="Party Fud Logo" width={128} height={40} />
          </div>

          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h2>
            <p className="text-center text-base text-gray-600">
              Join Party Fud and start your journey today
            </p>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md shadow-sm">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="First name"
                />
                <Input
                  label="Last Name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Last name"
                />
              </div>

              <PhoneInput
                label="Phone Number"
                required
                value={formData.phone}
                onChange={(phone) => setFormData({ ...formData, phone })}
                placeholder="50 123 4567"
              />

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
                placeholder="Create a strong password"
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-[#268700] focus:ring-[#268700] border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link href="#" className="text-[#268700] hover:text-[#1f6b00] font-medium">
                  Terms and Conditions
                </Link>
              </label>
            </div>

            <div>
              <Button type="submit" variant="primary" className="w-full py-3 text-base font-semibold" isLoading={isLoading}>
                Create Account
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="font-semibold text-[#268700] hover:text-[#1f6b00]">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}

