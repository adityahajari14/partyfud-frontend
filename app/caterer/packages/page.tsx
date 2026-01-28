'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { catererApi, Package } from '@/lib/api/caterer.api';
import { userApi } from '@/lib/api/user.api';

// Component for package image with fallback
const PackageImage: React.FC<{ imageUrl: string | null; packageName: string }> = ({ imageUrl, packageName }) => {
  const [imageError, setImageError] = React.useState(false);
  const [fallbackError, setFallbackError] = React.useState(false);

  const fallbackImage = '/logo2.svg';

  return (
    <div className="w-full h-56 bg-gray-100 flex items-center justify-center overflow-hidden relative">
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={packageName}
          className={`w-full h-full ${imageUrl === '/logo2.svg' || imageUrl.includes('logo2.svg') ? "object-contain p-4" : "object-cover"}`}
          onError={() => setImageError(true)}
        />
      ) : !fallbackError ? (
        <div className="w-full h-full bg-white flex items-center justify-center p-8">
          <img
            src={fallbackImage}
            alt="PartyFud"
            className="w-full h-full object-contain"
            onError={() => setFallbackError(true)}
          />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-2 border-dashed border-amber-200">
          <div className="relative">
            {/* Food Package Icon */}
            <svg
              className="w-20 h-20 text-amber-600 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            {/* Food Icons Overlay */}
            <div className="absolute -top-1 -right-1">
              <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-amber-700 font-semibold text-center px-3 uppercase tracking-wide">
            {packageName || 'Package'}
          </p>
          <p className="text-xs text-amber-600 text-center px-3 mt-1">Food Package</p>
        </div>
      )}
    </div>
  );
};

export default function PackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [catererStatus, setCatererStatus] = useState<string | null>(null);
  const [occasions, setOccasions] = useState<Array<{ value: string; label: string }>>([
    { value: '', label: 'All Occasions' },
  ]);
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
    fetchOccasions();
    fetchCatererStatus();
  }, []);

  const fetchCatererStatus = async () => {
    try {
      const response = await catererApi.getCatererInfo();
      if (response.data && typeof response.data === 'object' && 'status' in response.data) {
        setCatererStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error fetching caterer status:', error);
    }
  };

  useEffect(() => {
    // Filter packages based on selected occasion
    if (selectedOccasion) {
      setPackages(allPackages.filter(pkg =>
        pkg.occasions && pkg.occasions.some((occ: any) => occ.occassion?.id === selectedOccasion || occ.id === selectedOccasion)
      ));
    } else {
      setPackages(allPackages);
    }
  }, [selectedOccasion, allPackages]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await catererApi.getAllPackages();

      // Handle API response structure
      // The apiRequest returns { data: <parsed JSON> }
      // If API returns { success: true, data: [...] }, then response.data = { success: true, data: [...] }
      if (response.data) {
        const data = response.data as any;
        let packagesList: Package[] = [];
        if (Array.isArray(data)) {
          // Direct array response
          packagesList = data;
        } else if (data.data && Array.isArray(data.data)) {
          // Wrapped in { success: true, data: [...] } structure
          packagesList = data.data;
        } else {
          // Fallback: empty array
          console.warn('Unexpected packages API response structure:', data);
          packagesList = [];
        }
        setAllPackages(packagesList);
        setPackages(packagesList);
      } else {
        setAllPackages([]);
        setPackages([]);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setAllPackages([]);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOccasions = async () => {
    try {
      const occasionsResponse = await userApi.getOccasions();

      let apiOccasions: Array<{ value: string; label: string }> = [];

      if (occasionsResponse.data?.data) {
        apiOccasions = occasionsResponse.data.data.map((occ: any) => ({
          value: occ.id,
          label: occ.name,
        }));
      }

      setOccasions([
        { value: '', label: 'All Occasions' },
        ...apiOccasions,
      ]);
    } catch (error) {
      console.error('Error fetching occasions:', error);
      setOccasions([
        { value: '', label: 'All Occasions' },
      ]);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    setDeleteError(null);

    try {
      const response = await catererApi.deletePackage(id);

      if (response.error) {
        setDeleteError(response.error || 'Failed to delete package. Please try again.');
      } else {
        setDeleteConfirm(null);
        await fetchPackages();
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      setDeleteError('An unexpected error occurred. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Header
        onAddClick={catererStatus === 'PENDING' ? undefined : () => router.push('/caterer/packages/create')}
        addButtonText={catererStatus === 'PENDING' ? 'Awaiting Approval' : '+ Create Package'}
        showAddButton={true}
      />
      <main className="flex-1 p-4 lg:p-6 pt-20 lg:pt-24 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Pending Approval Banner */}
          {catererStatus === 'PENDING' && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Awaiting Approval:</span> You can view packages but cannot create new ones until your profile is approved.
                </p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Packages</h1>
            <p className="text-gray-700">Create and manage your catering packages</p>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <Select
              label="Filter by Occasion"
              options={occasions}
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              placeholder="All Occasions"
            />
          </div>

          {/* Packages Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700]"></div>
            </div>
          ) : !Array.isArray(packages) || packages.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-700 mb-4">No packages found. Create your first package to get started.</p>
              {catererStatus === 'PENDING' ? (
                <div className="inline-block">
                  <Button disabled variant="outline" className="opacity-50 cursor-not-allowed">
                    + Create Menu (Awaiting Approval)
                  </Button>
                  <p className="text-xs text-yellow-600 mt-2">Your profile must be approved before creating packages</p>
                </div>
              ) : (
                <Button onClick={() => router.push('/caterer/packages/create')} variant="primary">
                  + Create Menu
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
                  {/* Image Section - Always present for consistent alignment */}
                  <PackageImage imageUrl={pkg.cover_image_url || null} packageName={pkg.name} />

                  {/* Content Section */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="font-semibold text-xl text-gray-900 mb-2 line-clamp-2">{pkg.name}</h3>

                    {/* People Count */}
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-sm text-gray-700 font-medium">{pkg.people_count} People</p>
                    </div>

                    {/* Price and Status */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${pkg.is_available
                            ? 'bg-[#e8f5e0] text-[#1a5a00]'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {pkg.is_available ? 'Available' : 'Unavailable'}
                        </span>
                        <div className="text-right">
                          {!pkg.is_custom_price && (
                            <p className="text-xs text-gray-500 mb-0.5">Starting from</p>
                          )}
                          <p className="text-xl font-bold text-gray-900">
                            {pkg.currency} {typeof pkg.total_price === 'number' ? pkg.total_price.toLocaleString() : parseInt(String(pkg.total_price || '0'), 10).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-0 !border-2 !border-gray-900 !text-gray-900 hover:!bg-gray-100 hover:!border-gray-700 !focus:ring-gray-900 cursor-pointer"
                          onClick={() => router.push(`/caterer/packages/${pkg.id}/edit`)}
                        >
                          Edit Package
                        </Button>
                        <button
                          onClick={() => setDeleteConfirm(pkg.id)}
                          className="p-2 bg-red-50 border-2 border-red-500 hover:bg-red-100 rounded-lg transition-colors shrink-0 w-10 h-10 flex items-center justify-center"
                          aria-label="Delete package"
                        >
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => {
          if (!deleting) {
            setDeleteConfirm(null);
            setDeleteError(null);
          }
        }}
        title="Confirm Delete"
        size="sm"
      >
        <p className="text-gray-800 mb-6">
          Are you sure you want to delete this package? This action cannot be undone.
        </p>
        {deleteError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{deleteError}</p>
          </div>
        )}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setDeleteConfirm(null);
              setDeleteError(null);
            }}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
}

