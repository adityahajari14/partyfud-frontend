'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { catererApi } from '@/lib/api/caterer.api';
import { authApi } from '@/lib/api/auth.api';

interface FormData {
    business_name: string;
    business_type: string;
    business_description: string;
    service_area: string;
    minimum_guests: string;
    maximum_guests: string;
    preparation_time: string;
    region: string;
    delivery_only: boolean;
    delivery_plus_setup: boolean;
    full_service: boolean;
    staff: string;
    servers: string;
    food_license: File | null;
    registration: File | null;
    existing_food_license_url: string;
    existing_registration_url: string;
}

export default function CatererProfilePage() {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    
    const [formData, setFormData] = useState<FormData>({
        business_name: '',
        business_type: '',
        business_description: '',
        service_area: '',
        minimum_guests: '',
        maximum_guests: '',
        preparation_time: '',
        region: '',
        delivery_only: false,
        delivery_plus_setup: false,
        full_service: false,
        staff: '',
        servers: '',
        food_license: null,
        registration: null,
        existing_food_license_url: '',
        existing_registration_url: '',
    });

    const BUSINESS_TYPES = [
        'Bakery',
        'Restaurant',
        'Cloud Kitchen',
        'Catering Company',
        'Home Chef',
    ];

    const REGIONS = [
        'Abu Dhabi',
        'Dubai',
        'Sharjah',
        'Ajman',
        'Ras Al Khaimah',
        'Fujairah',
        'Umm Al Quwain',
        'UAE',
    ];

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
                    business_name: info.business_name || '',
                    business_type: info.business_type || '',
                    business_description: info.business_description || '',
                    service_area: info.service_area || '',
                    minimum_guests: info.minimum_guests?.toString() || '',
                    maximum_guests: info.maximum_guests?.toString() || '',
                    preparation_time: info.preparation_time?.toString() || '',
                    region: info.region || '',
                    delivery_only: info.delivery_only || false,
                    delivery_plus_setup: info.delivery_plus_setup || false,
                    full_service: info.full_service || false,
                    staff: info.staff?.toString() || '',
                    servers: info.servers?.toString() || '',
                    food_license: null,
                    registration: null,
                    existing_food_license_url: info.food_license || '',
                    existing_registration_url: info.Registration || '',
                });
            }
        } catch (error) {
            console.error('Error fetching caterer info:', error);
            setSubmitError('Failed to load caterer information');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError('');
        setSubmitSuccess('');

        try {
            // Validate required fields
            if (!formData.business_name || !formData.business_type || !formData.business_description ||
                !formData.service_area || !formData.minimum_guests || !formData.maximum_guests ||
                !formData.preparation_time || !formData.region) {
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

            // Create FormData object
            const submitFormData = new FormData();
            submitFormData.append('business_name', formData.business_name);
            submitFormData.append('business_type', formData.business_type);
            submitFormData.append('business_description', formData.business_description);
            submitFormData.append('service_area', formData.service_area);
            submitFormData.append('minimum_guests', formData.minimum_guests);
            submitFormData.append('maximum_guests', formData.maximum_guests);
            submitFormData.append('preparation_time', formData.preparation_time);
            submitFormData.append('region', formData.region);
            submitFormData.append('delivery_only', formData.delivery_only.toString());
            submitFormData.append('delivery_plus_setup', formData.delivery_plus_setup.toString());
            submitFormData.append('full_service', formData.full_service.toString());
            submitFormData.append('staff', formData.staff || '0');
            submitFormData.append('servers', formData.servers || '0');
            
            // Add files or existing URLs
            if (formData.food_license) {
                submitFormData.append('food_license', formData.food_license);
            } else if (formData.existing_food_license_url) {
                submitFormData.append('food_license', formData.existing_food_license_url);
            }
            
            if (formData.registration) {
                submitFormData.append('Registration', formData.registration);
            } else if (formData.existing_registration_url) {
                submitFormData.append('Registration', formData.existing_registration_url);
            }

            const response = await catererApi.updateCatererInfo(submitFormData);

            if (response.error) {
                setSubmitError(response.error);
                setIsSubmitting(false);
            } else {
                setSubmitSuccess('Profile updated successfully!');
                await refreshUser();
                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    router.push('/caterer/dashboard');
                }, 2000);
            }
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'An error occurred while updating');
            setIsSubmitting(false);
        }
    };

    const foodLicenseInputRef = useRef<HTMLInputElement>(null);
    const registrationInputRef = useRef<HTMLInputElement>(null);

    const validateAndSetFile = (file: File, type: 'food_license' | 'registration') => {
        setSubmitError('');

        if (!['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            setSubmitError('Only PDF, PNG, or JPG files are allowed');
            return false;
        }

        if (file.size > 5 * 1024 * 1024) {
            setSubmitError('Each file must be under 5MB');
            return false;
        }

        if (type === 'food_license') {
            setFormData({ ...formData, food_license: file });
        } else {
            setFormData({ ...formData, registration: file });
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

                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    label="Service Area *" 
                                    value={formData.service_area}
                                    onChange={(e) => setFormData({ ...formData, service_area: e.target.value })}
                                />

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Region *
                                    </label>
                                    <select 
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#268700]"
                                        value={formData.region}
                                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                    >
                                        <option value="">Select region</option>
                                        {REGIONS.map((region) => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
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
