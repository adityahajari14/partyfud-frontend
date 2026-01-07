'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin.api';

interface CatererDetail {
  id: string;
  business_name: string;
  business_type: string;
  business_description: string | null;
  cuisines: string[];
  service_area: string | null;
  minimum_guests: number | null;
  maximum_guests: number | null;
  preparation_time: number | null;
  region: string | null;
  delivery_only: boolean;
  delivery_plus_setup: boolean;
  full_service: boolean;
  staff: number | null;
  servers: number | null;
  food_license: string | null;
  Registration: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
  created_at: string;
  updated_at: string;
  caterer: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company_name: string | null;
    image_url: string | null;
    profile_completed: boolean;
    verified: boolean;
    created_at: string;
  };
}

export default function CatererDetailPage() {
  const params = useParams();
  const router = useRouter();
  const catererId = params.id as string;

  const [caterer, setCaterer] = useState<CatererDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    if (catererId) {
      fetchCatererDetails();
    }
  }, [catererId]);

  const fetchCatererDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getCatererInfoById(catererId);
      
      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      if (response.data?.success && response.data.data) {
        // Backend returns cuisines from the caterer's packages
        setCaterer(response.data.data as any);
      } else {
        setError('Caterer information not found.');
      }
    } catch (err) {
      console.error('Error fetching caterer details:', err);
      setError('An unexpected error occurred while fetching details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockCaterer = async () => {
    if (!caterer) return;

    // Confirm action
    const confirmed = window.confirm(
      `Are you sure you want to block ${caterer.business_name}? This action will change their status to BLOCKED.`
    );

    if (!confirmed) return;

    setBlocking(true);
    setError(null);

    try {
      const response = await adminApi.updateCatererInfoStatus(catererId, 'BLOCKED');

      if (response.error) {
        setError(response.error);
        setBlocking(false);
        return;
      }

      if (response.data?.success) {
        // Refresh the caterer details to show updated status
        await fetchCatererDetails();
        alert('Caterer has been blocked successfully.');
      } else {
        setError('Failed to block caterer. Please try again.');
      }
    } catch (err) {
      console.error('Error blocking caterer:', err);
      setError('An unexpected error occurred while blocking the caterer.');
    } finally {
      setBlocking(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-600"></div>
            <p className="text-gray-600 mt-4 text-sm font-medium">Loading caterer details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !caterer) {
    return (
      <main className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-lg shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">{error}</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/caterers')}
            className="px-6 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm shadow-sm"
          >
            ← Back to Caterers
          </button>
        </div>
      </main>
    );
  }

  if (!caterer) {
    return (
      <main className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">Caterer information not found.</p>
            <button
              onClick={() => router.push('/admin/caterers')}
              className="px-6 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm shadow-sm"
            >
              ← Back to Caterers
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <button
            onClick={() => router.push('/admin/caterers')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <span>←</span>
            <span>Back to Caterers</span>
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{caterer.business_name}</h1>
              <p className="text-base text-gray-600">{caterer.business_type}</p>
            </div>
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase ${
                caterer.status === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-700'
                  : caterer.status === 'PENDING'
                  ? 'bg-amber-100 text-amber-700'
                  : caterer.status === 'REJECTED'
                  ? 'bg-red-100 text-red-700'
                  : caterer.status === 'BLOCKED'
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {caterer.status}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-lg shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-4 text-red-500 hover:text-red-700 font-bold text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          {/* Cuisines */}
          {caterer.cuisines && caterer.cuisines.length > 0 && (
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gray-300 rounded-full"></span>
                Cuisines
              </h2>
              <div className="flex flex-wrap gap-2">
                {caterer.cuisines.map((cuisine, idx) => (
                  <span
                    key={idx}
                    className="text-sm font-medium bg-green-100 text-green-700 px-3 py-1.5 rounded-full border border-green-200"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Business Information */}
          <section className="border-b border-gray-200 pb-6 last:border-b-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gray-300 rounded-full"></span>
              Business Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Business Name</label>
                <p className="text-gray-900 font-medium text-base">{caterer.business_name}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Business Type</label>
                <p className="text-gray-900 font-medium text-base">{caterer.business_type}</p>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                <p className="text-gray-700 leading-relaxed">
                  {caterer.business_description || <span className="text-gray-400 italic">No description provided</span>}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Service Area</label>
                <p className="text-gray-900 font-medium">{caterer.service_area || <span className="text-gray-400">N/A</span>}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Region</label>
                <p className="text-gray-900 font-medium">{caterer.region || <span className="text-gray-400">N/A</span>}</p>
              </div>
            </div>
          </section>

          {/* Capacity Information */}
          <section className="border-b border-gray-200 pb-6 last:border-b-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gray-300 rounded-full"></span>
              Capacity & Staff
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Minimum Guests</label>
                <p className="text-gray-900 font-medium text-lg">{caterer.minimum_guests || <span className="text-gray-400">N/A</span>}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Maximum Guests</label>
                <p className="text-gray-900 font-medium text-lg">{caterer.maximum_guests || <span className="text-gray-400">N/A</span>}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preparation Time</label>
                <p className="text-gray-900 font-medium text-lg">
                  {caterer.preparation_time ? `${caterer.preparation_time} hours` : <span className="text-gray-400">N/A</span>}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Staff Count</label>
                <p className="text-gray-900 font-medium text-lg">{caterer.staff || <span className="text-gray-400">N/A</span>}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Servers Count</label>
                <p className="text-gray-900 font-medium text-lg">{caterer.servers || <span className="text-gray-400">N/A</span>}</p>
              </div>
            </div>
          </section>

          {/* Service Options */}
          <section className="border-b border-gray-200 pb-6 last:border-b-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gray-300 rounded-full"></span>
              Service Options
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <input
                  type="checkbox"
                  checked={caterer.delivery_only}
                  disabled
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-gray-900 font-medium">Delivery Only</label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <input
                  type="checkbox"
                  checked={caterer.delivery_plus_setup}
                  disabled
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-gray-900 font-medium">Delivery + Setup</label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <input
                  type="checkbox"
                  checked={caterer.full_service}
                  disabled
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-gray-900 font-medium">Full Service</label>
              </div>
            </div>
          </section>

          {/* Caterer Contact Information */}
          <section className="border-b border-gray-200 pb-6 last:border-b-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gray-300 rounded-full"></span>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
                <p className="text-gray-900 font-medium text-base">
                  {caterer.caterer.first_name} {caterer.caterer.last_name}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                <p className="text-gray-900 font-medium text-base break-all">{caterer.caterer.email}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                <p className="text-gray-900 font-medium text-base">{caterer.caterer.phone}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company Name</label>
                <p className="text-gray-900 font-medium">
                  {caterer.caterer.company_name || <span className="text-gray-400">N/A</span>}
                </p>
              </div>
            </div>
          </section>

          {/* Documents */}
          <section className="border-b border-gray-200 pb-6 last:border-b-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gray-300 rounded-full"></span>
              Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Food License</label>
                {caterer.food_license ? (
                  <a
                    href={caterer.food_license}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    <span>View Food License</span>
                    <span>↗</span>
                  </a>
                ) : (
                  <p className="text-gray-400 italic">Not provided</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Registration</label>
                {caterer.Registration ? (
                  <a
                    href={caterer.Registration}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    <span>View Registration</span>
                    <span>↗</span>
                  </a>
                ) : (
                  <p className="text-gray-400 italic">Not provided</p>
                )}
              </div>
            </div>
          </section>

          {/* Timestamps */}
          <section className="border-b border-gray-200 pb-6 last:border-b-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gray-300 rounded-full"></span>
              Timestamps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Created At</label>
                <p className="text-gray-900 font-medium">
                  {new Date(caterer.created_at).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Updated</label>
                <p className="text-gray-900 font-medium">
                  {new Date(caterer.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleBlockCaterer}
              disabled={blocking || caterer.status === 'BLOCKED'}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm ${
                blocking || caterer.status === 'BLOCKED'
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md'
              }`}
            >
              {blocking ? 'Blocking...' : 'BLOCK CATERER'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

