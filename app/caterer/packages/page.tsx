'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { catererApi, Package } from '@/lib/api/caterer.api';

// Component for package image with fallback
const PackageImage: React.FC<{ imageUrl: string | null; packageName: string }> = ({ imageUrl, packageName }) => {
  const [imageError, setImageError] = React.useState(false);
  const [fallbackError, setFallbackError] = React.useState(false);

  const fallbackImage = '/default_dish.jpg';

  return (
    <div className="w-full h-56 bg-gray-100 flex items-center justify-center overflow-hidden relative">
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={packageName}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : !fallbackError ? (
        <img
          src={fallbackImage}
          alt={packageName}
          className="w-full h-full object-cover"
          onError={() => setFallbackError(true)}
        />
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

const DEFAULT_PACKAGE_TYPES = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'house_party', label: 'House Party' },
];

export default function PackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [packageTypes, setPackageTypes] = useState<Array<{ value: string; label: string }>>([
    { value: '', label: 'Select Package Type' },
  ]);
  const [selectedPackageType, setSelectedPackageType] = useState('');

  useEffect(() => {
    fetchPackages();
    fetchPackageTypes();
  }, []);

  useEffect(() => {
    // Filter packages based on selected package type
    if (selectedPackageType) {
      setPackages(allPackages.filter(pkg => pkg.package_type_id === selectedPackageType));
    } else {
      setPackages(allPackages);
    }
  }, [selectedPackageType, allPackages]);

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

  const fetchPackageTypes = async () => {
    try {
      const packageTypesResponse = await catererApi.getPackageTypes();

      let apiTypes: Array<{ value: string; label: string }> = [];

      if (packageTypesResponse.data) {
        const data = packageTypesResponse.data as any;
        const typesList = Array.isArray(data) ? data : (data.data || []);

        apiTypes = typesList.map((pt: any) => ({
          value: pt.id || pt.value,
          label: pt.name || pt.label,
        }));
      }

      // ✅ Merge default + API types (avoid duplicates)
      const mergedTypes = [
        ...DEFAULT_PACKAGE_TYPES,
        ...apiTypes.filter(
          apiType =>
            !DEFAULT_PACKAGE_TYPES.some(
              defaultType => defaultType.value === apiType.value
            )
        ),
      ];

      setPackageTypes([
        { value: '', label: 'Select Package Type' },
        ...mergedTypes,
      ]);
    } catch (error) {
      console.error('Error fetching package types:', error);

      // ✅ Even if API fails, user still gets defaults
      setPackageTypes([
        { value: '', label: 'Select Package Type' },
        ...DEFAULT_PACKAGE_TYPES,
      ]);
    }
  };

  return (
    <>
      <Header
        onAddClick={() => router.push('/caterer/packages/create')}
        addButtonText="+ Create a Package"
        showAddButton={true}
      />
      <main className="flex-1 p-4 lg:p-6 pt-20 lg:pt-24 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Packages</h1>
            <p className="text-gray-700">Create and manage your catering packages</p>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <Select
              label="Package Type"
              options={packageTypes}
              value={selectedPackageType}
              onChange={(e) => setSelectedPackageType(e.target.value)}
              placeholder="Select Package Type"
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
              <Button onClick={() => router.push('/caterer/packages/create')} variant="primary">
                Create Package
              </Button>
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
                          <p className="text-xs text-gray-500 mb-0.5">Starting from</p>
                          <p className="text-xl font-bold text-gray-900">
                            {pkg.currency} {typeof pkg.total_price === 'number' ? pkg.total_price.toFixed(2) : parseFloat(pkg.total_price || '0').toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => router.push(`/caterer/packages/${pkg.id}/edit`)}
                      >
                        Edit Package
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

