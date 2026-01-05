'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { catererApi, UpdatePackageRequest, Package } from '@/lib/api/caterer.api';

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;

  const [packageData, setPackageData] = useState<Package | null>(null);
  const [formData, setFormData] = useState<UpdatePackageRequest>({
    name: '',
    people_count: 0,
    package_type_id: '',
    cover_image_url: '',
    total_price: 0,
    currency: 'AED',
    is_active: true,
    is_available: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [packageTypes, setPackageTypes] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    fetchPackageTypes();
    fetchPackage();
  }, [packageId]);

  const fetchPackageTypes = async () => {
    const response = await catererApi.getPackageTypes();
    console.log('📋 Package types response:', response);
    
    // Handle both response structures: direct data or nested data
    const typesData = (response.data as any)?.data || response.data;
    
    if (typesData && Array.isArray(typesData)) {
      const types = typesData.map((type: any) => ({
        value: type.id,
        label: type.name,
      }));
      setPackageTypes(types);
      console.log('✅ Package types loaded:', types.length);
    } else {
      console.error('❌ Package types response is not an array:', response);
    }
  };

  const fetchPackage = async () => {
    setLoading(true);
    console.log('🔍 Fetching package:', packageId);
    const response = await catererApi.getPackageById(packageId);
    console.log('📦 Package response:', response);

    // Handle both response structures: direct data or nested data
    const pkg = (response.data as any)?.data || response.data;
    
    if (pkg && pkg.id) {
      console.log('✅ Package data received:', pkg);
      setPackageData(pkg);
      // Initialize form with current package data
      const initialFormData = {
        name: pkg.name || '',
        people_count: pkg.people_count || 0,
        package_type_id: pkg.package_type_id || '',
        cover_image_url: pkg.cover_image_url || '',
        total_price: Number(pkg.total_price) || 0,
        currency: pkg.currency || 'AED',
        is_active: pkg.is_active ?? true,
        is_available: pkg.is_available ?? true,
      };
      console.log('📝 Setting form data:', initialFormData);
      setFormData(initialFormData);
    } else if (response.error) {
      console.error('❌ Error loading package:', response.error);
      setErrors({ general: 'Failed to load package. Please try again.' });
    } else {
      console.error('❌ Invalid package response structure:', response);
      setErrors({ general: 'Failed to load package data.' });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Package name is required';
    }
    if (!formData.people_count || formData.people_count <= 0) {
      newErrors.people_count = 'Number of people must be greater than 0';
    }
    if (!formData.package_type_id) {
      newErrors.package_type_id = 'Please select a package type';
    }
    if (!formData.total_price || formData.total_price <= 0) {
      newErrors.total_price = 'Price must be greater than 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    const response = await catererApi.updatePackage(packageId, formData);

    if (response.error) {
      // Handle specific error cases with user-friendly messages
      let errorMessage = response.error;
      
      if (errorMessage.includes('Foreign key') || errorMessage.includes('constraint')) {
        if (errorMessage.includes('package_type')) {
          errorMessage = 'The selected package type is invalid. Please select a valid type from the dropdown.';
        } else {
          errorMessage = 'Unable to update package due to invalid data. Please check all fields.';
        }
      } else if (errorMessage.includes('not found') || errorMessage.includes('permission')) {
        errorMessage = 'Package not found or you do not have permission to edit it.';
      } else if (errorMessage.includes('Invalid package type')) {
        errorMessage = 'Please select a valid package type from the dropdown.';
      }
      
      setErrors({ general: errorMessage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsSubmitting(false);
      return;
    }

    // Success - redirect to packages page
    router.push('/caterer/packages');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700]"></div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Package not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-4 text-sm text-gray-600">
          <span>Packages</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Edit Package</span>
        </div>

        {/* Back Button and Title */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Package</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* General Information Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">General Information</h2>
            
            {errors.general && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Name of the Package"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter package name"
                error={errors.name}
              />
              <Input
                label="People"
                type="number"
                value={formData.people_count?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, people_count: parseInt(e.target.value) || undefined })}
                placeholder="Enter number of people"
                error={errors.people_count}
              />
              <Select
                label="Type"
                options={packageTypes}
                value={formData.package_type_id || ''}
                onChange={(e) => setFormData({ ...formData, package_type_id: e.target.value })}
                placeholder="Select Package Type"
                error={errors.package_type_id}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover image
                </label>
                <Input
                  type="url"
                  value={formData.cover_image_url || ''}
                  onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                  placeholder="Enter image URL"
                />
              </div>
            </div>
          </div>

          {/* Price Information */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">AED</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.total_price?.toString() || ''}
                    onChange={(e) => setFormData({ ...formData, total_price: parseFloat(e.target.value) || undefined })}
                    placeholder="Enter Price"
                    error={errors.total_price}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active ?? true}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#268700] border-gray-300 rounded focus:ring-[#268700]"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Active
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available ?? true}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4 text-[#268700] border-gray-300 rounded focus:ring-[#268700]"
                  />
                  <label htmlFor="is_available" className="text-sm text-gray-700">
                    Available
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <div>
              <span className="text-gray-700">Total Price: </span>
              <span className="text-xl font-bold text-gray-900">
                AED {formData.total_price !== undefined
                  ? (typeof formData.total_price === 'number' ? formData.total_price.toFixed(2) : parseFloat(String(formData.total_price || '0')).toFixed(2))
                  : (packageData?.total_price ? (typeof packageData.total_price === 'number' ? packageData.total_price.toFixed(2) : parseFloat(String(packageData.total_price || '0')).toFixed(2)) : '0.00')}
              </span>
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Discard
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
              >
                Save Package
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

