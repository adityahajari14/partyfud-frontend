'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin.api';

type Status = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';

interface CatererInfo {
  id: string;
  business_name: string;
  business_type: string;
  business_description: string | null;
  service_area: string | null;
  minimum_guests: number | null;
  maximum_guests: number | null;
  region: string | null;
  delivery_only: boolean;
  delivery_plus_setup: boolean;
  full_service: boolean;
  staff: number | null;
  servers: number | null;
  food_license: string | null;
  Registration: string | null;
  caterer_id: string;
  status: Status;
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

const mapStatusToFrontend = (status: Status): 'pending' | 'approved' | 'rejected' => {
  const statusMap: Record<Status, 'pending' | 'approved' | 'rejected'> = {
    'PENDING': 'pending',
    'APPROVED': 'approved',
    'REJECTED': 'rejected',
    'BLOCKED': 'rejected',
  };
  return statusMap[status] || 'pending';
};

const mapStatusToBackend = (status: 'pending' | 'approved' | 'rejected'): Status => {
  const statusMap: Record<'pending' | 'approved' | 'rejected', Status> = {
    'pending': 'PENDING',
    'approved': 'APPROVED',
    'rejected': 'REJECTED',
  };
  return statusMap[status];
};

export default function CatererDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [catererInfo, setCatererInfo] = useState<CatererInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchCatererInfo = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await adminApi.getCatererInfoById(id);

        if (response.error) {
          setError(response.error);
          setLoading(false);
          return;
        }

        if (response.data?.success && response.data.data) {
          setCatererInfo(response.data.data);
        } else {
          setError('Caterer information not found');
        }
      } catch (err) {
        console.error('Error fetching caterer info:', err);
        setError('Failed to load caterer information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatererInfo();
  }, [id]);

  const handleStatusUpdate = async (newStatus: 'pending' | 'approved' | 'rejected') => {
    if (!catererInfo) return;

    setUpdating(true);
    try {
      const backendStatus = mapStatusToBackend(newStatus);
      const response = await adminApi.updateCatererInfoStatus(catererInfo.id, backendStatus);

      if (response.error) {
        setError(`Failed to update status: ${response.error}`);
        setUpdating(false);
        return;
      }

      // Update local state
      setCatererInfo((prev) => prev ? { ...prev, status: backendStatus } : null);
      
      // Optionally redirect back to approvals page
      // router.push('/admin/approvals');
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading caterer information...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !catererInfo) {
    return (
      <main className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <button
            onClick={() => router.push('/admin/approvals')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            Back to Approvals
          </button>
        </div>
      </main>
    );
  }

  if (!catererInfo) {
    return null;
  }

  const currentStatus = mapStatusToFrontend(catererInfo.status);

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/admin/approvals')}
              className="text-gray-600 hover:text-gray-900 mb-2"
            >
              ← Back to Approvals
            </button>
            <h1 className="text-3xl font-bold">{catererInfo.business_name}</h1>
            <p className="text-gray-500 mt-1">{catererInfo.business_type}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : currentStatus === 'approved'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {currentStatus.toUpperCase()}
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
          {/* Business Information */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Business Name</label>
                <p className="text-gray-900">{catererInfo.business_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Business Type</label>
                <p className="text-gray-900">{catererInfo.business_type}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">
                  {catererInfo.business_description || 'No description provided'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Service Area</label>
                <p className="text-gray-900">{catererInfo.service_area || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Region</label>
                <p className="text-gray-900">{catererInfo.region || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Capacity Information */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Capacity & Staff</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Minimum Guests</label>
                <p className="text-gray-900">{catererInfo.minimum_guests || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Maximum Guests</label>
                <p className="text-gray-900">{catererInfo.maximum_guests || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Staff Count</label>
                <p className="text-gray-900">{catererInfo.staff || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Servers Count</label>
                <p className="text-gray-900">{catererInfo.servers || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Service Options */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Service Options</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={catererInfo.delivery_only}
                  disabled
                  className="mr-2"
                />
                <label className="text-gray-900">Delivery Only</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={catererInfo.delivery_plus_setup}
                  disabled
                  className="mr-2"
                />
                <label className="text-gray-900">Delivery + Setup</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={catererInfo.full_service}
                  disabled
                  className="mr-2"
                />
                <label className="text-gray-900">Full Service</label>
              </div>
            </div>
          </section>

          {/* Caterer Contact Information */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">
                  {catererInfo.caterer.first_name} {catererInfo.caterer.last_name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{catererInfo.caterer.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{catererInfo.caterer.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Company Name</label>
                <p className="text-gray-900">
                  {catererInfo.caterer.company_name || 'N/A'}
                </p>
              </div>
            </div>
          </section>

          {/* Documents */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Food License</label>
                {catererInfo.food_license ? (
                  <a
                    href={catererInfo.food_license}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block mt-1"
                  >
                    View Food License
                  </a>
                ) : (
                  <p className="text-gray-500 mt-1">Not provided</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Registration</label>
                {catererInfo.Registration ? (
                  <a
                    href={catererInfo.Registration}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block mt-1"
                  >
                    View Registration
                  </a>
                ) : (
                  <p className="text-gray-500 mt-1">Not provided</p>
                )}
              </div>
            </div>
          </section>

          {/* Timestamps */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Timestamps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-gray-900">
                  {new Date(catererInfo.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">
                  {new Date(catererInfo.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </section>

          {/* Actions */}
          {currentStatus === 'pending' && (
            <section className="pt-4 border-t">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={updating}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
                >
                  {updating ? 'Updating...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={updating}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600"
                >
                  {updating ? 'Updating...' : 'Reject'}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

