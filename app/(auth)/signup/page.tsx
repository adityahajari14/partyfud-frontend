'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
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
    if (user) {
      setIsLoading(false); // Reset loading when user is available
      if (user.type === 'CATERER') {
        router.replace('/caterer/dashboard');
      } else if (user.type === 'USER') {
        router.replace('/user/dashboard');
      } else if (user.type === 'ADMIN') {
        router.replace('/admin/dashboard');
      }
    }
  }, [user, router, setIsLoading]);

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
        // Ensure error is always a string
        setError(typeof result.error === 'string' ? result.error : String(result.error));
        setIsLoading(false);
      } else {
        // If no error, wait a bit for user state to update, then reset loading
        // This handles the case where redirect might not happen immediately
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
    // Redirect will happen via useEffect when user state updates
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Food Theme Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#268700] to-[#1f6b00] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl">🎂</div>
          <div className="absolute top-32 right-20 text-5xl">🍖</div>
          <div className="absolute bottom-32 left-20 text-6xl">🍕</div>
          <div className="absolute bottom-20 right-10 text-5xl">🍗</div>
          <div className="absolute top-1/2 left-1/4 text-4xl">🥘</div>
          <div className="absolute top-1/3 right-1/3 text-5xl">🍱</div>
          <div className="absolute bottom-1/4 right-1/4 text-4xl">🍜</div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
              <span className="text-white font-bold text-4xl">P</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">Join Party Fud</h1>
            <p className="text-xl text-white/90 max-w-md text-center">
              Start your journey with us. Whether you're looking for catering or offering services, we've got you covered.
            </p>
          </div>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Quick & Easy Registration</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Access to Premium Features</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>24/7 Customer Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-md w-full space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#268700] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
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
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all ${
                userType === 'USER'
                  ? 'bg-[#268700] text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              👤 User
            </button>
            <button
              type="button"
              onClick={() => setUserType('CATERER')}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all ${
                userType === 'CATERER'
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

