'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface BusinessProfileProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

interface CuisineType {
  id: string;
  name: string;
}

interface Certification {
  id: string;
  name: string;
}

const BUSINESS_TYPES = [
  'Restaurant',
  'Catering Company',
  'Home Kitchen',
  'Food Truck',
  'Cloud Kitchen',
  'Hotel',
  'Other',
];

const CERTIFICATIONS_LIST = [
  'Food Hygiene Level 2',
  'Kosher Certified',
  'Organic Certified',
  'Halal Certified',
  'Allergen Training',
];

const MAX_TRAVEL_DISTANCES = [
  { value: '10km', label: '10 km' },
  { value: '25km', label: '25 km' },
  { value: '50km', label: '50 km' },
  { value: '100km', label: '100+ km' },
];

export function BusinessProfile({ data, updateData, onNext }: BusinessProfileProps) {
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch cuisine types from API
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/occasions/cuisines`)
      .then((res) => res.json())
      .then((response) => {
        if (response.data) {
          setCuisineTypes(response.data);
        }
      })
      .catch((err) => console.error('Error fetching cuisines:', err));
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.business_name?.trim()) {
      newErrors.business_name = 'Business name is required';
    }
    if (!data.business_type) {
      newErrors.business_type = 'Please select a business type';
    }
    if (!data.region?.trim()) {
      newErrors.region = 'Service area is required';
    }
    if (data.minimum_guests < 1) {
      newErrors.minimum_guests = 'Minimum guests must be at least 1';
    }
    if (data.maximum_guests < data.minimum_guests) {
      newErrors.maximum_guests = 'Maximum guests must be greater than minimum';
    }
    if (data.cuisine_types.length === 0) {
      newErrors.cuisine_types = 'Select at least one cuisine type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const toggleCuisine = (cuisineId: string) => {
    const current = data.cuisine_types || [];
    if (current.includes(cuisineId)) {
      updateData({ cuisine_types: current.filter((id: string) => id !== cuisineId) });
    } else {
      updateData({ cuisine_types: [...current, cuisineId] });
    }
  };

  const toggleCertification = (cert: string) => {
    const current = data.certifications || [];
    if (current.includes(cert)) {
      updateData({ certifications: current.filter((c: string) => c !== cert) });
    } else {
      updateData({ certifications: [...current, cert] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Profile</h2>
        <p className="text-gray-600">Tell us about your catering business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.business_name}
            onChange={(e) => updateData({ business_name: e.target.value })}
            placeholder="e.g., The Gourmet Kitchen"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          {errors.business_name && (
            <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type <span className="text-red-500">*</span>
          </label>
          <select
            value={data.business_type}
            onChange={(e) => updateData({ business_type: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select type</option>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.business_type && (
            <p className="mt-1 text-sm text-red-600">{errors.business_type}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Description
        </label>
        <textarea
          value={data.business_description}
          onChange={(e) => updateData({ business_description: e.target.value })}
          placeholder="Tell customers about your business, specialties, and experience..."
          rows={4}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Service Area"
            required
            value={data.region || ''}
            onChange={(e) => updateData({ region: e.target.value })}
            placeholder="e.g., Dubai, Abu Dhabi"
            error={errors.region}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Travel Distance
          </label>
          <select
            value={data.service_area}
            onChange={(e) => updateData({ service_area: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select distance</option>
            {MAX_TRAVEL_DISTANCES.map((dist) => (
              <option key={dist.value} value={dist.value}>
                {dist.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Guests <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={data.minimum_guests}
            onChange={(e) => updateData({ minimum_guests: parseInt(e.target.value) || 0 })}
            placeholder="e.g., 10"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          {errors.minimum_guests && (
            <p className="mt-1 text-sm text-red-600">{errors.minimum_guests}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Guests <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={data.maximum_guests}
            onChange={(e) => updateData({ maximum_guests: parseInt(e.target.value) || 0 })}
            placeholder="e.g., 500"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          {errors.maximum_guests && (
            <p className="mt-1 text-sm text-red-600">{errors.maximum_guests}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Cuisine Types <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {cuisineTypes.map((cuisine) => {
            const isSelected = data.cuisine_types?.includes(cuisine.id);
            return (
              <button
                key={cuisine.id}
                type="button"
                onClick={() => toggleCuisine(cuisine.id)}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition ${
                  isSelected
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cuisine.name}
              </button>
            );
          })}
        </div>
        {errors.cuisine_types && (
          <p className="mt-2 text-sm text-red-600">{errors.cuisine_types}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Certifications</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CERTIFICATIONS_LIST.map((cert) => {
            const isSelected = data.certifications?.includes(cert);
            return (
              <button
                key={cert}
                type="button"
                onClick={() => toggleCertification(cert)}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cert}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleNext} className="px-8">
          Continue to Menu Type →
        </Button>
      </div>
    </div>
  );
}
