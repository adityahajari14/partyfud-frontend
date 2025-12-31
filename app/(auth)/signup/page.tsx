'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import Image from 'next/image';

export default function SignupPage() {
  const router = useRouter();
  const [justSignedUp, setJustSignedUp] = useState(false);
  const { signup, user } = useAuth();
  const [userType, setUserType] = useState<'USER' | 'CATERER'>('USER');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    company_name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!user || justSignedUp) return;

    if (user.type === 'CATERER') {
      router.replace('/caterer/dashboard');
    } else if (user.type === 'USER') {
      router.replace('/user/dashboard');
    } else if (user.type === 'ADMIN') {
      router.replace('/admin/dashboard');
    }
  }, [user, justSignedUp, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (userType === 'CATERER' && !formData.company_name.trim()) {
      setError('Company name is required for caterers');
      return;
    }

    setIsLoading(true);

    try {
      const signupData = {
        ...formData,
        type: userType,
        ...(userType === 'CATERER' && { company_name: formData.company_name }),
      };

      const result = await signup(signupData);

      if (result.error) {
        setError(String(result.error));
        setIsLoading(false);
      } else {
        setJustSignedUp(true);

        if (userType === 'CATERER') {
          router.replace('/caterer/details');
        } else {
          router.replace('/user/dashboard');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
    // Redirect will happen via useEffect when user state updates
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

          {/* User Type Selection */}
          <div className="flex gap-3 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setUserType('USER')}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all ${userType === 'USER'
                  ? 'bg-[#268700] text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
                }`}
            >
              👤 User
            </button>
            <button
              type="button"
              onClick={() => setUserType('CATERER')}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all ${userType === 'CATERER'
                  ? 'bg-[#268700] text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
                }`}
            >
              🏢 Caterer
            </button>
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

              <Input
                label="Phone Number"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+971501234567"
              />

              <Input
                label="Email address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />

              {userType === 'CATERER' && (
                <Input
                  label="Company Name"
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Enter company name"
                />
              )}

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
                <Link href="/login" className="font-semibold text-[#268700] hover:text-[#1f6b00]">
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

