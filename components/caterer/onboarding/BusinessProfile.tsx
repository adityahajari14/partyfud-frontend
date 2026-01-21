'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MapPin, X } from 'lucide-react';

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

const SERVICE_AREAS = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
];

export function BusinessProfile({ data, updateData, onNext }: BusinessProfileProps) {
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [foodLicenseFile, setFoodLicenseFile] = useState<File | null>(null);
  const [registrationFile, setRegistrationFile] = useState<File | null>(null);
  const [foodLicensePreview, setFoodLicensePreview] = useState<string | null>(data.food_license || null);
  const [registrationPreview, setRegistrationPreview] = useState<string | null>(data.Registration || null);
  const foodLicenseInputRef = useRef<HTMLInputElement>(null);
  const registrationInputRef = useRef<HTMLInputElement>(null);
  const [serviceAreaSearch, setServiceAreaSearch] = useState('');
  const [showServiceAreaDropdown, setShowServiceAreaDropdown] = useState(false);
  const serviceAreaRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serviceAreaRef.current && !serviceAreaRef.current.contains(event.target as Node)) {
        setShowServiceAreaDropdown(false);
      }
    };

    if (showServiceAreaDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showServiceAreaDropdown]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.business_name?.trim()) {
      newErrors.business_name = 'Business name is required';
    }
    if (!data.business_type) {
      newErrors.business_type = 'Please select a business type';
    }
    if (!data.region || (Array.isArray(data.region) && data.region.length === 0)) {
      newErrors.region = 'Please select at least one service area';
    }
    if (!data.minimum_guests || data.minimum_guests < 1) {
      newErrors.minimum_guests = 'Minimum guests must be at least 1';
    }
    if (!data.maximum_guests || data.maximum_guests < 1) {
      newErrors.maximum_guests = 'Maximum guests must be at least 1';
    } else if (data.minimum_guests && data.maximum_guests < data.minimum_guests) {
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

  const toggleServiceArea = (area: string) => {
    const current = Array.isArray(data.region) ? data.region : (data.region ? [data.region] : []);
    if (current.includes(area)) {
      updateData({ region: current.filter((a: string) => a !== area) });
    } else {
      updateData({ region: [...current, area] });
    }
  };

  const handleFoodLicenseChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFoodLicenseFile(file);
    
    // Upload file to backend
    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('field', 'food_license');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/caterer/onboarding/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setFoodLicensePreview(result.data.url);
          updateData({ food_license: result.data.url });
        }
      } else {
        setErrors({ ...errors, food_license: 'Failed to upload food license' });
      }
    } catch (error) {
      console.error('Error uploading food license:', error);
      setErrors({ ...errors, food_license: 'Failed to upload food license' });
    }
  };

  const handleRegistrationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRegistrationFile(file);
    
    // Upload file to backend
    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('field', 'Registration');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/caterer/onboarding/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setRegistrationPreview(result.data.url);
          updateData({ Registration: result.data.url });
        }
      } else {
        setErrors({ ...errors, Registration: 'Failed to upload registration' });
      }
    } catch (error) {
      console.error('Error uploading registration:', error);
      setErrors({ ...errors, Registration: 'Failed to upload registration' });
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

      <div ref={serviceAreaRef} className="relative">
        <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide uppercase">
          Service Area <span className="text-red-500">*</span>
        </label>
        
        {/* Selected Areas Display */}
        {(() => {
          const current = Array.isArray(data.region) ? data.region : (data.region ? [data.region] : []);
          return current.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {current.map((area: string) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium"
                >
                  <MapPin size={14} className="text-green-600" />
                  {area}
                  <button
                    type="button"
                    onClick={() => toggleServiceArea(area)}
                    className="ml-1 hover:bg-green-100 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} className="text-green-600" />
                  </button>
                </span>
              ))}
            </div>
          ) : null;
        })()}

        {/* Searchable Dropdown */}
        <div className="relative">
          <div
            onClick={() => setShowServiceAreaDropdown(!showServiceAreaDropdown)}
            className={`w-full bg-gray-50/50 border-2 ${
              errors.region ? 'border-red-300' : 'border-gray-200'
            } rounded-xl px-4 py-3.5 pl-11 pr-10 text-sm font-medium appearance-none transition-all duration-200 focus:outline-none focus:border-[#268700] focus:bg-white focus:ring-4 focus:ring-[#268700]/10 text-gray-900 hover:border-gray-300 cursor-pointer ${
              showServiceAreaDropdown ? 'border-[#268700] bg-white ring-4 ring-[#268700]/10' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={(() => {
                const current = Array.isArray(data.region) ? data.region : (data.region ? [data.region] : []);
                return current.length === 0 ? 'text-gray-400' : 'text-gray-900';
              })()}>
                {(() => {
                  const current = Array.isArray(data.region) ? data.region : (data.region ? [data.region] : []);
                  return current.length === 0 
                    ? 'Select service areas (e.g., Dubai, Abu Dhabi)' 
                    : `${current.length} area${current.length > 1 ? 's' : ''} selected`;
                })()}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${showServiceAreaDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />

          {/* Dropdown Menu */}
          {showServiceAreaDropdown && (
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-80 overflow-hidden">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  value={serviceAreaSearch}
                  onChange={(e) => setServiceAreaSearch(e.target.value)}
                  placeholder="Search locations..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#268700] focus:border-[#268700]"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Options List */}
              <div className="max-h-64 overflow-y-auto">
                {SERVICE_AREAS.filter((area) =>
                  area.toLowerCase().includes(serviceAreaSearch.toLowerCase())
                ).map((area) => {
                  const current = Array.isArray(data.region) ? data.region : (data.region ? [data.region] : []);
                  const isSelected = current.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => {
                        toggleServiceArea(area);
                        setServiceAreaSearch('');
                      }}
                      className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center gap-2 ${
                        isSelected
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <MapPin size={14} className="text-gray-400" />
                      <span>{area}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {errors.region && (
          <p className="mt-2 text-sm text-red-600">{errors.region}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.minimum_guests ? String(data.minimum_guests).replace(/^0+/, '') || '' : ''}
            onChange={(e) => {
              const value = e.target.value;
              // Remove any non-numeric characters
              const numericValue = value.replace(/[^0-9]/g, '');
              
              // Only update if value is empty or a valid number
              if (numericValue === '') {
                updateData({ minimum_guests: undefined });
              } else {
                const numValue = parseInt(numericValue, 10);
                if (!isNaN(numValue) && numValue >= 0) {
                  updateData({ minimum_guests: numValue });
                }
              }
            }}
            onBlur={(e) => {
              // Remove leading zeros on blur
              const value = e.target.value;
              if (value && !isNaN(Number(value))) {
                const numValue = parseInt(value, 10);
                if (!isNaN(numValue)) {
                  updateData({ minimum_guests: numValue });
                }
              }
            }}
            placeholder="e.g., 10"
            className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-4 ${
              errors.minimum_guests
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                : 'border-gray-200 focus:border-[#268700] focus:ring-[#268700]/10'
            } bg-white hover:border-gray-300`}
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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.maximum_guests ? String(data.maximum_guests).replace(/^0+/, '') || '' : ''}
            onChange={(e) => {
              const value = e.target.value;
              // Remove any non-numeric characters
              const numericValue = value.replace(/[^0-9]/g, '');
              
              // Only update if value is empty or a valid number
              if (numericValue === '') {
                updateData({ maximum_guests: undefined });
              } else {
                const numValue = parseInt(numericValue, 10);
                if (!isNaN(numValue) && numValue >= 0) {
                  updateData({ maximum_guests: numValue });
                }
              }
            }}
            onBlur={(e) => {
              // Remove leading zeros on blur
              const value = e.target.value;
              if (value && !isNaN(Number(value))) {
                const numValue = parseInt(value, 10);
                if (!isNaN(numValue)) {
                  updateData({ maximum_guests: numValue });
                }
              }
            }}
            placeholder="e.g., 500"
            className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-4 ${
              errors.maximum_guests
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                : 'border-gray-200 focus:border-[#268700] focus:ring-[#268700]/10'
            } bg-white hover:border-gray-300`}
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

      {/* Food License Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Food License
        </label>
        <div className="flex items-center gap-4">
          <input
            ref={foodLicenseInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFoodLicenseChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => foodLicenseInputRef.current?.click()}
            className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {foodLicensePreview ? 'Change File' : 'Upload Food License'}
          </button>
          {foodLicensePreview && (
            <div className="flex items-center gap-2">
              <a
                href={foodLicensePreview}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline"
              >
                View Uploaded File
              </a>
            </div>
          )}
        </div>
        {errors.food_license && (
          <p className="mt-1 text-sm text-red-600">{errors.food_license}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Upload your food license document (PDF, JPG, PNG)</p>
      </div>

      {/* Registration Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Registration
        </label>
        <div className="flex items-center gap-4">
          <input
            ref={registrationInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleRegistrationChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => registrationInputRef.current?.click()}
            className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {registrationPreview ? 'Change File' : 'Upload Registration'}
          </button>
          {registrationPreview && (
            <div className="flex items-center gap-2">
              <a
                href={registrationPreview}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline"
              >
                View Uploaded File
              </a>
            </div>
          )}
        </div>
        {errors.Registration && (
          <p className="mt-1 text-sm text-red-600">{errors.Registration}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Upload your registration document (PDF, JPG, PNG)</p>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleNext} className="px-8">
          Continue to Menu Type →
        </Button>
      </div>
    </div>
  );
}
