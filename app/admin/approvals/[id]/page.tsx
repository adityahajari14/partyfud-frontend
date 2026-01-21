'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin.api';

type Status = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';

// Custom slider styles 
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    border: 2px solid #268700;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    border: 2px solid #268700;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .slider::-ms-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    border: 2px solid #268700;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

interface CatererInfo {
  id: string;
  business_name: string;
  business_type: string;
  business_description: string | null;
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
  commission_rate?: number | null;
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
  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string } | null>(null);

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
          const data = response.data.data as any;
          setCatererInfo(data);
          // Set initial commission rate from API or default to 0
          setCommissionRate(data.commission_rate || 0);
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
      <main className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-600"></div>
            <p className="text-gray-600 mt-4 text-sm font-medium">Loading caterer information...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !catererInfo) {
    return (
      <main className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-lg shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">{error}</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/approvals')}
            className="px-6 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm shadow-sm"
          >
            ← Back to Approvals
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
    <main className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <style>{sliderStyles}</style>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <button
            onClick={() => router.push('/admin/approvals')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <span>←</span>
            <span>Back to Approvals</span>
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{catererInfo.business_name}</h1>
              <p className="text-base text-gray-600">{catererInfo.business_type}</p>
            </div>
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase ${
                currentStatus === 'pending'
                  ? 'bg-amber-100 text-amber-700'
                  : currentStatus === 'approved'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {currentStatus.toUpperCase()}
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
          {/* Business Information */}
          <section className="border-b border-gray-200 pb-6 last:border-b-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gray-300 rounded-full"></span>
              Business Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Business Name</label>
                <p className="text-gray-900 font-medium text-base">{catererInfo.business_name}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Business Type</label>
                <p className="text-gray-900 font-medium text-base">{catererInfo.business_type}</p>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                <p className="text-gray-700 leading-relaxed">
                  {catererInfo.business_description || <span className="text-gray-400 italic">No description provided</span>}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Service Area</label>
                <p className="text-gray-900 font-medium">{catererInfo.service_area || <span className="text-gray-400">N/A</span>}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Region</label>
                <p className="text-gray-900 font-medium">{catererInfo.region || <span className="text-gray-400">N/A</span>}</p>
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
                <p className="text-gray-900 font-medium text-lg">{catererInfo.minimum_guests || <span className="text-gray-400">N/A</span>}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Maximum Guests</label>
                <p className="text-gray-900 font-medium text-lg">{catererInfo.maximum_guests || <span className="text-gray-400">N/A</span>}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preparation Time</label>
                <p className="text-gray-900 font-medium text-lg">
                  {catererInfo.preparation_time ? `${catererInfo.preparation_time} hours` : <span className="text-gray-400">N/A</span>}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Staff Count</label>
                <p className="text-gray-900 font-medium text-lg">{catererInfo.staff || <span className="text-gray-400">N/A</span>}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Servers Count</label>
                <p className="text-gray-900 font-medium text-lg">{catererInfo.servers || <span className="text-gray-400">N/A</span>}</p>
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
                  checked={catererInfo.delivery_only}
                  disabled
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-gray-900 font-medium">Delivery Only</label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <input
                  type="checkbox"
                  checked={catererInfo.delivery_plus_setup}
                  disabled
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-gray-900 font-medium">Delivery + Setup</label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <input
                  type="checkbox"
                  checked={catererInfo.full_service}
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
                  {catererInfo.caterer.first_name} {catererInfo.caterer.last_name}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                <p className="text-gray-900 font-medium text-base break-all">{catererInfo.caterer.email}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                <p className="text-gray-900 font-medium text-base">{catererInfo.caterer.phone}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company Name</label>
                <p className="text-gray-900 font-medium">
                  {catererInfo.caterer.company_name || <span className="text-gray-400">N/A</span>}
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
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-3">Food License</label>
                {catererInfo.food_license ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setViewingDocument({ url: catererInfo.food_license!, name: 'Food License' })}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    <a
                      href={catererInfo.food_license}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">Not provided</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-3">Registration</label>
                {catererInfo.Registration ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setViewingDocument({ url: catererInfo.Registration!, name: 'Registration' })}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    <a
                      href={catererInfo.Registration}
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">Not provided</p>
                )}
              </div>
            </div>
          </section>

          {/* Commission */}
          <section className="border-b border-gray-200 pb-6 last:border-b-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gray-300 rounded-full"></span>
              Commission
            </h2>
            <div className="space-y-4">
              <div className="relative">
                {/* Slider Track */}
                <div className="relative h-2 bg-gray-200 rounded-full">
                  {/* Filled portion */}
                  <div
                    className="absolute h-2 bg-[#268700] rounded-full transition-all duration-200"
                    style={{ width: `${(commissionRate / 80) * 100}%` }}
                  />
                  {/* Slider Handle */}
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider"
                    style={{
                      background: 'transparent',
                    }}
                  />
                </div>
                {/* Percentage Labels */}
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>0%</span>
                  <span className="font-semibold text-gray-900">{commissionRate}%</span>
                  <span>80%</span>
                </div>
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
                  {new Date(catererInfo.created_at).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Updated</label>
                <p className="text-gray-900 font-medium">
                  {new Date(catererInfo.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </section>

          {/* Actions */}
          {currentStatus === 'pending' && (
            <section className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gray-300 rounded-full"></span>
                Actions
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={updating}
                  className="flex-1 bg-emerald-600 text-white py-3.5 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md"
                >
                  {updating ? 'Updating...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={updating}
                  className="flex-1 bg-red-600 text-white py-3.5 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                >
                  {updating ? 'Updating...' : 'Reject'}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={() => setViewingDocument(null)}>
          <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{viewingDocument.name}</h3>
              <button
                onClick={() => setViewingDocument(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {viewingDocument.url.toLowerCase().endsWith('.pdf') || viewingDocument.url.includes('pdf') ? (
                <iframe
                  src={viewingDocument.url}
                  className="w-full h-full min-h-[600px] border-0 rounded"
                  title={viewingDocument.name}
                />
              ) : (
                <img
                  src={viewingDocument.url}
                  alt={viewingDocument.name}
                  className="max-w-full h-auto mx-auto rounded"
                />
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <a
                href={viewingDocument.url}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
              <button
                onClick={() => setViewingDocument(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

