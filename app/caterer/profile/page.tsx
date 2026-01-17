'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { catererApi } from '@/lib/api/caterer.api';
import { authApi } from '@/lib/api/auth.api';
import { MapPin, X } from 'lucide-react';

interface FormData {
    // User profile fields
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    company_name: string;
    logo: File | null;
    existing_logo_url: string;
    // Caterer info fields
    business_name: string;
    business_type: string;
    business_description: string;
    service_area: string;
    minimum_guests: string;
    maximum_guests: string;
    preparation_time: string;
    region: string | string[];
    delivery_only: boolean;
    delivery_plus_setup: boolean;
    full_service: boolean;
    staff: string;
    servers: string;
    food_license: File | null;
    registration: File | null;
    existing_food_license_url: string;
    existing_registration_url: string;
    gallery_images: string[];
    new_gallery_images: File[];
}

export default function CatererProfilePage() {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    
    const [formData, setFormData] = useState<FormData>({
        // User profile fields
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        company_name: '',
        logo: null,
        existing_logo_url: '',
        // Caterer info fields
        business_name: '',
        business_type: '',
        business_description: '',
        service_area: '',
        minimum_guests: '',
        maximum_guests: '',
        preparation_time: '',
        region: [],
        delivery_only: false,
        delivery_plus_setup: false,
        full_service: false,
        staff: '',
        servers: '',
        food_license: null,
        registration: null,
        existing_food_license_url: '',
        existing_registration_url: '',
        gallery_images: [],
        new_gallery_images: [],
    });

    const BUSINESS_TYPES = [
        'Bakery',
        'Restaurant',
        'Cloud Kitchen',
        'Catering Company',
        'Home Chef',
    ];

    const SERVICE_AREAS = [
        // Emirates
        'Dubai',
        'Abu Dhabi',
        'Sharjah',
        'Ajman',
        'Umm Al Quwain',
        'Ras Al Khaimah',
        'Fujairah',
        'Al Ain',
        // Dubai Areas
        'Downtown Dubai',
        'Dubai Marina',
        'Jumeirah',
        'Palm Jumeirah',
        'Business Bay',
        'Dubai International Financial Centre (DIFC)',
        'Dubai Mall Area',
        'Burj Al Arab Area',
        'Dubai Festival City',
        'Dubai Sports City',
        'Dubai Media City',
        'Dubai Internet City',
        'Dubai Knowledge Park',
        'Dubai Healthcare City',
        'Dubai World Trade Centre',
        'Dubai Creek',
        'Deira',
        'Bur Dubai',
        'Al Barsha',
        'Jumeirah Beach Residence (JBR)',
        'Dubai Hills',
        'Arabian Ranches',
        'Emirates Hills',
        'Dubai Silicon Oasis',
        'Dubai Production City',
        'Dubai Studio City',
    ];

    const [serviceAreaSearch, setServiceAreaSearch] = useState('');
    const [showServiceAreaDropdown, setShowServiceAreaDropdown] = useState(false);
    const serviceAreaRef = useRef<HTMLDivElement>(null);

    // Redirect if not a caterer
    useEffect(() => {
        if (!authLoading && user && user.type !== 'CATERER') {
            router.replace('/');
        }
    }, [user, authLoading, router]);

    // Fetch caterer info
    useEffect(() => {
        if (!authLoading && user && user.type === 'CATERER') {
            fetchCatererInfo();
        }
    }, [user, authLoading]);

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

    const fetchCatererInfo = async () => {
        setLoading(true);
        try {
            const response = await catererApi.getCatererInfo();
            
            if (response.error) {
                setSubmitError(response.error);
                setLoading(false);
                return;
            }

            if (response.data) {
                const apiResponse = response.data as any;
                const info = apiResponse.success ? apiResponse.data : apiResponse;
                setFormData({
                    // User profile fields from user context
                    first_name: user?.first_name || '',
                    last_name: user?.last_name || '',
                    phone: user?.phone || '',
                    email: user?.email || '',
                    company_name: user?.company_name || '',
                    logo: null,
                    existing_logo_url: user?.image_url || '',
                    // Caterer info fields
                    business_name: info.business_name || '',
                    business_type: info.business_type || '',
                    business_description: info.business_description || '',
                    service_area: info.service_area || '',
                    minimum_guests: info.minimum_guests?.toString() || '',
                    maximum_guests: info.maximum_guests?.toString() || '',
                    preparation_time: info.preparation_time?.toString() || '',
                    region: Array.isArray(info.region) ? info.region : (info.region ? [info.region] : []),
                    delivery_only: info.delivery_only || false,
                    delivery_plus_setup: info.delivery_plus_setup || false,
                    full_service: info.full_service || false,
                    staff: info.staff?.toString() || '',
                    servers: info.servers?.toString() || '',
                    food_license: null,
                    registration: null,
                    existing_food_license_url: info.food_license || '',
                    existing_registration_url: info.Registration || '',
                    gallery_images: info.gallery_images || [],
                    new_gallery_images: [],
                });
            }
        } catch (error) {
            console.error('Error fetching caterer info:', error);
            setSubmitError('Failed to load caterer information');
        } finally {
            setLoading(false);
        }
    };

    const toggleServiceArea = (area: string) => {
        const current = Array.isArray(formData.region) ? formData.region : (formData.region ? [formData.region] : []);
        if (current.includes(area)) {
            setFormData({ ...formData, region: current.filter((a: string) => a !== area) });
        } else {
            setFormData({ ...formData, region: [...current, area] });
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError('');
        setSubmitSuccess('');

        try {
            // Validate required fields
            if (!formData.first_name || !formData.last_name || !formData.phone || !formData.email ||
                !formData.business_name || !formData.business_type || !formData.business_description ||
                !formData.minimum_guests || !formData.maximum_guests ||
                !formData.preparation_time || 
                !formData.region || 
                (Array.isArray(formData.region) && formData.region.length === 0)) {
                setSubmitError('Please fill in all required fields');
                setIsSubmitting(false);
                return;
            }

            // Validate at least one delivery option is selected
            if (!formData.delivery_only && !formData.delivery_plus_setup && !formData.full_service) {
                setSubmitError('Please select at least one delivery option');
                setIsSubmitting(false);
                return;
            }

            // Update user profile first
            const userFormData = new FormData();
            userFormData.append('first_name', formData.first_name);
            userFormData.append('last_name', formData.last_name);
            userFormData.append('phone', formData.phone);
            userFormData.append('email', formData.email);
            userFormData.append('company_name', formData.company_name || '');
            
            if (formData.logo) {
                userFormData.append('image', formData.logo);
            } else if (formData.existing_logo_url) {
                userFormData.append('image_url', formData.existing_logo_url);
            }

            const userResponse = await authApi.updateUserProfile(userFormData);
            
            if (userResponse.error) {
                setSubmitError(userResponse.error);
                setIsSubmitting(false);
                return;
            }

            // Update caterer info
            const catererFormData = new FormData();
            catererFormData.append('business_name', formData.business_name);
            catererFormData.append('business_type', formData.business_type);
            catererFormData.append('business_description', formData.business_description);
            catererFormData.append('service_area', formData.service_area);
            catererFormData.append('minimum_guests', formData.minimum_guests);
            catererFormData.append('maximum_guests', formData.maximum_guests);
            catererFormData.append('preparation_time', formData.preparation_time);
            // Handle region as array
            const regionArray = Array.isArray(formData.region) ? formData.region : (formData.region ? [formData.region] : []);
            catererFormData.append('region', JSON.stringify(regionArray));
            catererFormData.append('delivery_only', formData.delivery_only.toString());
            catererFormData.append('delivery_plus_setup', formData.delivery_plus_setup.toString());
            catererFormData.append('full_service', formData.full_service.toString());
            catererFormData.append('staff', formData.staff || '0');
            catererFormData.append('servers', formData.servers || '0');
            
            // Add files or existing URLs
            if (formData.food_license) {
                catererFormData.append('food_license', formData.food_license);
            } else if (formData.existing_food_license_url) {
                catererFormData.append('food_license', formData.existing_food_license_url);
            }
            
            if (formData.registration) {
                catererFormData.append('Registration', formData.registration);
            } else if (formData.existing_registration_url) {
                catererFormData.append('Registration', formData.existing_registration_url);
            }

            // Add new gallery images (files)
            formData.new_gallery_images.forEach((file) => {
                catererFormData.append('gallery_images', file);
            });
            
            // Always send existing gallery images as JSON string (even if empty, to allow deletion)
            catererFormData.append('existing_gallery_images', JSON.stringify(formData.gallery_images));

            const catererResponse = await authApi.submitCatererInfo(catererFormData, true);

            if (catererResponse.error) {
                setSubmitError(catererResponse.error);
                setIsSubmitting(false);
            } else {
                setSubmitSuccess('Profile updated successfully!');
                await refreshUser();
                setIsSubmitting(false);
                // Refresh the form data to show updated information
                fetchCatererInfo();
            }
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'An error occurred while updating');
            setIsSubmitting(false);
        }
    };

    const logoInputRef = useRef<HTMLInputElement>(null);
    const foodLicenseInputRef = useRef<HTMLInputElement>(null);
    const registrationInputRef = useRef<HTMLInputElement>(null);

    const validateAndSetFile = (file: File, type: 'food_license' | 'registration' | 'logo') => {
        setSubmitError('');

        if (type === 'logo') {
            if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                setSubmitError('Logo must be PNG or JPG');
                return false;
            }
        } else {
            if (!['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                setSubmitError('Only PDF, PNG, or JPG files are allowed');
                return false;
            }
        }

        if (file.size > 5 * 1024 * 1024) {
            setSubmitError('Each file must be under 5MB');
            return false;
        }

        if (type === 'food_license') {
            setFormData({ ...formData, food_license: file });
        } else if (type === 'registration') {
            setFormData({ ...formData, registration: file });
        } else if (type === 'logo') {
            setFormData({ ...formData, logo: file });
        }
        return true;
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#268700]"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="mb-6">
                        <button
                            onClick={() => router.push('/caterer/dashboard')}
                            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <span>←</span>
                            <span>Back to Dashboard</span>
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
                        <p className="text-gray-600 mt-2">Update your business information</p>
                    </div>

                    {submitError && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md">
                            <p className="font-medium">{submitError}</p>
                        </div>
                    )}

                    {submitSuccess && (
                        <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-md">
                            <p className="font-medium">{submitSuccess}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Logo Upload */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Logo / Profile Picture</h2>
                            
                            <div className="flex items-center gap-6">
                                {/* Logo Preview */}
                                <div className="relative">
                                    {formData.logo || formData.existing_logo_url ? (
                                        <img
                                            src={formData.logo ? URL.createObjectURL(formData.logo) : formData.existing_logo_url}
                                            alt="Logo"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-4xl text-gray-400">
                                                {formData.first_name?.[0] || user?.first_name?.[0] || '?'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <button
                                        type="button"
                                        onClick={() => logoInputRef.current?.click()}
                                        className="px-4 py-2 bg-[#268700] text-white rounded-md hover:bg-[#1f6b00] transition"
                                    >
                                        {formData.logo || formData.existing_logo_url ? 'Change Logo' : 'Upload Logo'}
                                    </button>
                                    {(formData.logo || formData.existing_logo_url) && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, logo: null, existing_logo_url: '' })}
                                            className="ml-3 px-4 py-2 text-red-600 hover:text-red-700 transition"
                                        >
                                            Remove
                                        </button>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">PNG or JPG (max 5MB)</p>
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        className="hidden"
                                        accept=".png,.jpg,.jpeg"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                validateAndSetFile(e.target.files[0], 'logo');
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <Input 
                                    label="First Name *" 
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                />
                                <Input 
                                    label="Last Name *" 
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <Input 
                                    label="Phone *" 
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                                <Input 
                                    label="Email *" 
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <Input 
                                label="Company Name" 
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            />
                        </div>

                        {/* Business Information */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h2>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <Input 
                                    label="Business Name *" 
                                    value={formData.business_name}
                                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                />

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Business Type *
                                    </label>
                                    <select 
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#268700]"
                                        value={formData.business_type}
                                        onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                                    >
                                        <option value="">Select business type</option>
                                        {BUSINESS_TYPES.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1 mb-4">
                                <label className="text-sm font-medium text-gray-700">
                                    Description *
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#268700]"
                                    value={formData.business_description}
                                    onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                                />
                            </div>

                            <div>
                                <div ref={serviceAreaRef} className="relative">
                                    <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide uppercase">
                                        Service Area <span className="text-red-500">*</span>
                                    </label>
                                    
                                    {/* Selected Areas Display */}
                                    {(() => {
                                        const current = Array.isArray(formData.region) ? formData.region : (formData.region ? [formData.region] : []);
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
                                            className={`w-full bg-gray-50/50 border-2 border-gray-200 rounded-xl px-4 py-3.5 pl-11 pr-10 text-sm font-medium appearance-none transition-all duration-200 focus:outline-none focus:border-[#268700] focus:bg-white focus:ring-4 focus:ring-[#268700]/10 text-gray-900 hover:border-gray-300 cursor-pointer ${
                                                showServiceAreaDropdown ? 'border-[#268700] bg-white ring-4 ring-[#268700]/10' : ''
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={(() => {
                                                    const current = Array.isArray(formData.region) ? formData.region : (formData.region ? [formData.region] : []);
                                                    return current.length === 0 ? 'text-gray-400' : 'text-gray-900';
                                                })()}>
                                                    {(() => {
                                                        const current = Array.isArray(formData.region) ? formData.region : (formData.region ? [formData.region] : []);
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
                                                        const current = Array.isArray(formData.region) ? formData.region : (formData.region ? [formData.region] : []);
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
                                </div>
                            </div>
                        </div>

                        {/* Capacity */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Capacity & Preparation</h2>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <Input 
                                    label="Minimum Guests *" 
                                    type="number" 
                                    value={formData.minimum_guests}
                                    onChange={(e) => setFormData({ ...formData, minimum_guests: e.target.value })}
                                />
                                <Input 
                                    label="Maximum Guests *" 
                                    type="number" 
                                    value={formData.maximum_guests}
                                    onChange={(e) => setFormData({ ...formData, maximum_guests: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1 mb-4">
                                <label className="text-sm font-medium text-gray-700">
                                    Preparation Time (Hours) *
                                </label>
                                <select 
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#268700]"
                                    value={formData.preparation_time}
                                    onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                                >
                                    <option value="">Select preparation time needed before delivery</option>
                                    <option value="12">12 hours</option>
                                    <option value="24">24 hours (1 day)</option>
                                    <option value="48">48 hours (2 days)</option>
                                    <option value="72">72 hours (3 days)</option>
                                    <option value="96">96 hours (4 days)</option>
                                    <option value="120">120 hours (5 days)</option>
                                    <option value="168">168 hours (1 week)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    label="Staff Count" 
                                    type="number" 
                                    value={formData.staff}
                                    onChange={(e) => setFormData({ ...formData, staff: e.target.value })}
                                />
                                <Input 
                                    label="Servers Count" 
                                    type="number" 
                                    value={formData.servers}
                                    onChange={(e) => setFormData({ ...formData, servers: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Service Options */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Options *</h2>
                            
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.delivery_only}
                                        onChange={(e) => setFormData({ ...formData, delivery_only: e.target.checked })}
                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-[#268700] focus:ring-[#268700]"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Delivery Only</p>
                                        <p className="text-sm text-gray-500">Food delivered ready to serve</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.delivery_plus_setup}
                                        onChange={(e) => setFormData({ ...formData, delivery_plus_setup: e.target.checked })}
                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-[#268700] focus:ring-[#268700]"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Delivery + Setup</p>
                                        <p className="text-sm text-gray-500">We deliver and set up the food display</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.full_service}
                                        onChange={(e) => setFormData({ ...formData, full_service: e.target.checked })}
                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-[#268700] focus:ring-[#268700]"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Full Service</p>
                                        <p className="text-sm text-gray-500">Includes setup, service, and cleanup</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Gallery Images */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Gallery Images</h2>
                            <p className="text-sm text-gray-600 mb-4">Add multiple images to showcase your catering work. These will be displayed on your public profile page.</p>
                            
                            {/* Existing Images */}
                            {formData.gallery_images.length > 0 && (
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Current Gallery Images</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {formData.gallery_images.map((imageUrl, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={imageUrl}
                                                    alt={`Gallery ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        const newImages = formData.gallery_images.filter((_, i) => i !== index);
                                                        setFormData({ ...formData, gallery_images: newImages });
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all z-10"
                                                    title="Remove image"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Images Preview */}
                            {formData.new_gallery_images.length > 0 && (
                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">New Images to Upload</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {formData.new_gallery_images.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`New ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        const newFiles = formData.new_gallery_images.filter((_, i) => i !== index);
                                                        setFormData({ ...formData, new_gallery_images: newFiles });
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all z-10"
                                                    title="Remove image"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload Button */}
                            <div>
                                <input
                                    type="file"
                                    id="gallery-images-input"
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            const files = Array.from(e.target.files);
                                            const validFiles: File[] = [];
                                            
                                            files.forEach((file) => {
                                                if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                                                    setSubmitError('Only PNG or JPG images are allowed');
                                                    return;
                                                }
                                                if (file.size > 5 * 1024 * 1024) {
                                                    setSubmitError('Each image must be under 5MB');
                                                    return;
                                                }
                                                validFiles.push(file);
                                            });
                                            
                                            if (validFiles.length > 0) {
                                                setFormData({
                                                    ...formData,
                                                    new_gallery_images: [...formData.new_gallery_images, ...validFiles],
                                                });
                                                setSubmitError('');
                                            }
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const input = document.getElementById('gallery-images-input') as HTMLInputElement;
                                        input?.click();
                                    }}
                                    className="px-4 py-2 bg-[#268700] text-white rounded-md hover:bg-[#1f6b00] transition"
                                >
                                    Add Gallery Images
                                </button>
                                <p className="text-xs text-gray-500 mt-2">PNG or JPG (max 5MB per image, up to 10 images)</p>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="pb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
                            
                            <div className="space-y-4">
                                {/* Food License */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Food License</label>
                                    {formData.food_license ? (
                                        <div className="mt-2 flex items-center justify-between border rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded">
                                                    {formData.food_license.type.includes('pdf') ? 'PDF' : 'IMG'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{formData.food_license.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {(formData.food_license.size / (1024 * 1024)).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setFormData({ ...formData, food_license: null })}
                                                className="text-gray-400 hover:text-red-500 transition"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    ) : formData.existing_food_license_url ? (
                                        <div className="mt-2 flex items-center justify-between border rounded-lg p-4 bg-gray-50">
                                            <p className="text-sm text-gray-600">Current file uploaded</p>
                                            <button
                                                onClick={() => foodLicenseInputRef.current?.click()}
                                                className="text-sm text-[#268700] hover:underline"
                                            >
                                                Replace
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => foodLicenseInputRef.current?.click()}
                                            className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#268700] transition"
                                        >
                                            <p className="text-sm text-gray-600">
                                                Click to upload <span className="text-[#268700] font-medium">Food License</span>
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">PDF, PNG or JPG (max 5MB)</p>
                                        </div>
                                    )}
                                    <input
                                        ref={foodLicenseInputRef}
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                validateAndSetFile(e.target.files[0], 'food_license');
                                            }
                                        }}
                                    />
                                </div>

                                {/* Registration */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Registration</label>
                                    {formData.registration ? (
                                        <div className="mt-2 flex items-center justify-between border rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded">
                                                    {formData.registration.type.includes('pdf') ? 'PDF' : 'IMG'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{formData.registration.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {(formData.registration.size / (1024 * 1024)).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setFormData({ ...formData, registration: null })}
                                                className="text-gray-400 hover:text-red-500 transition"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    ) : formData.existing_registration_url ? (
                                        <div className="mt-2 flex items-center justify-between border rounded-lg p-4 bg-gray-50">
                                            <p className="text-sm text-gray-600">Current file uploaded</p>
                                            <button
                                                onClick={() => registrationInputRef.current?.click()}
                                                className="text-sm text-[#268700] hover:underline"
                                            >
                                                Replace
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => registrationInputRef.current?.click()}
                                            className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#268700] transition"
                                        >
                                            <p className="text-sm text-gray-600">
                                                Click to upload <span className="text-[#268700] font-medium">Registration</span>
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">PDF, PNG or JPG (max 5MB)</p>
                                        </div>
                                    )}
                                    <input
                                        ref={registrationInputRef}
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                validateAndSetFile(e.target.files[0], 'registration');
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between pt-6 border-t">
                            <Button 
                                variant="outline" 
                                onClick={() => router.push('/caterer/dashboard')}
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                isLoading={isSubmitting}
                                className="bg-[#268700] hover:bg-[#1f6b00]"
                            >
                                {isSubmitting ? 'Updating...' : 'Update Profile'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
