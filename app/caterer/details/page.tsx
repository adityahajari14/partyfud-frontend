'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api/auth.api';

type Step = 'profile' | 'availability' | 'licenses' | 'done';

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
}

export default function CatererDetailsPage() {
    const [step, setStep] = useState<Step>('profile');
    const { user, loading: authLoading, refreshUser } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    
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
    });

    // Redirect to dashboard if profile is already completed
    useEffect(() => {
        if (!authLoading && user && user.type === 'CATERER' && user.profile_completed === true) {
            router.replace('/caterer/dashboard');
        }
    }, [user, authLoading, router]);

    // Prevent navigation away if profile is not completed
    // Intercept browser back button and redirect back to details
    useEffect(() => {
        if (!authLoading && user && user.type === 'CATERER' && user.profile_completed === false) {
            // Replace current history entry to prevent back navigation
            window.history.replaceState(null, '', '/caterer/details');
            
            // Handle browser back button
            const handlePopState = () => {
                // Immediately redirect back to details if user tries to go back
                router.replace('/caterer/details');
            };

            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [user, authLoading, router]);

    // Validation functions for each step
    const isProfileStepComplete = () => {
        return !!(formData.business_name && formData.business_type && formData.business_description &&
            formData.service_area && formData.minimum_guests && formData.maximum_guests && formData.preparation_time);
    };

    const isAvailabilityStepComplete = () => {
        return !!(formData.region && 
            (formData.delivery_only || formData.delivery_plus_setup || formData.full_service));
    };

    const isLicensesStepComplete = () => {
        return !!(formData.food_license && formData.registration);
    };

    const handleSubmit = async () => {
        console.log('🟢 [FRONTEND] Submit button clicked');
        console.log('🟢 [FRONTEND] Form data:', {
            business_name: formData.business_name,
            business_type: formData.business_type,
            business_description: formData.business_description,
            service_area: formData.service_area,
            minimum_guests: formData.minimum_guests,
            maximum_guests: formData.maximum_guests,
            region: formData.region,
            delivery_only: formData.delivery_only,
            delivery_plus_setup: formData.delivery_plus_setup,
            full_service: formData.full_service,
            staff: formData.staff,
            servers: formData.servers,
            has_food_license: !!formData.food_license,
            has_registration: !!formData.registration,
        });
        
        setIsSubmitting(true);
        setSubmitError('');

        try {
            // Validate required fields
            console.log('🟢 [FRONTEND] Validating required fields...');
            if (!formData.business_name || !formData.business_type || !formData.business_description ||
                !formData.service_area || !formData.minimum_guests || !formData.maximum_guests ||
                !formData.preparation_time || !formData.region || !formData.food_license || !formData.registration) {
                console.log('❌ [FRONTEND] Validation failed - missing required fields');
                setSubmitError('Please fill in all required fields');
                setIsSubmitting(false);
                return;
            }
            console.log('✅ [FRONTEND] Required fields validation passed');

            // Validate at least one delivery option is selected
            console.log('🟢 [FRONTEND] Validating delivery options...');
            if (!formData.delivery_only && !formData.delivery_plus_setup && !formData.full_service) {
                console.log('❌ [FRONTEND] Validation failed - no delivery option selected');
                setSubmitError('Please select at least one delivery option');
                setIsSubmitting(false);
                return;
            }
            console.log('✅ [FRONTEND] Delivery options validation passed');

            // Create FormData object
            console.log('🟢 [FRONTEND] Creating FormData object...');
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
            
            if (formData.food_license) {
                console.log('🟢 [FRONTEND] Adding food_license file:', formData.food_license.name, formData.food_license.size, 'bytes');
                submitFormData.append('food_license', formData.food_license);
            }
            if (formData.registration) {
                console.log('🟢 [FRONTEND] Adding registration file:', formData.registration.name, formData.registration.size, 'bytes');
                submitFormData.append('Registration', formData.registration);
            }

            // Try to create first (POST)
            console.log('🟢 [FRONTEND] Attempting to create caterer info (POST)...');
            let response = await authApi.submitCatererInfo(submitFormData, false);
            console.log('🟢 [FRONTEND] POST response status:', response.status);
            console.log('🟢 [FRONTEND] POST response error:', response.error);
            console.log('🟢 [FRONTEND] POST response data:', response.data);

            // If 409 (already exists), try update (PUT)
            if (response.status === 409) {
                console.log('🟡 [FRONTEND] Caterer info already exists (409), switching to update (PUT)...');
                response = await authApi.submitCatererInfo(submitFormData, true);
                console.log('🟡 [FRONTEND] PUT response status:', response.status);
                console.log('🟡 [FRONTEND] PUT response error:', response.error);
                console.log('🟡 [FRONTEND] PUT response data:', response.data);
            }

            if (response.error) {
                console.log('❌ [FRONTEND] Error in response:', response.error);
                setSubmitError(response.error);
                setIsSubmitting(false);
            } else {
                console.log('✅ [FRONTEND] Success! Refreshing user data...');
                // Success - refresh user data and redirect to dashboard
                await refreshUser();
                console.log('✅ [FRONTEND] User data refreshed, redirecting to dashboard...');
                // Redirect to dashboard immediately
                router.replace('/caterer/dashboard');
            }
        } catch (error) {
            console.log('❌ [FRONTEND] Exception caught:', error);
            console.log('❌ [FRONTEND] Error details:', error instanceof Error ? error.message : String(error));
            setSubmitError(error instanceof Error ? error.message : 'An error occurred while submitting');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* LEFT SIDE */}
            <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#268700] to-[#66b447] relative overflow-hidden">
                <Image
                    src="/left_ui.svg"
                    alt="Food Theme"
                    fill
                    className="object-cover"
                />
                <div className="absolute text-4xl text-white m-8 p-6 leading-tight">
                    Unlock a new revenue stream, be part of the PartyFud platform
                </div>
                <p className="absolute text-lg text-white mx-8 mt-32 p-6 leading-tight">
                    We’re building the easiest way for food creators to reach parties, events, and celebrations across the UAE. Sign up now to join our waitlist.
                </p>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#66b447] px-4">
                <div className="bg-white w-full max-w-4xl rounded-xl p-8 shadow-lg">
                    {step !== 'done' && (
                        <Stepper 
                            current={step} 
                            profileComplete={isProfileStepComplete()}
                            availabilityComplete={isAvailabilityStepComplete()}
                        />
                    )}

                    {submitError && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md">
                            <p className="font-medium">{submitError}</p>
                        </div>
                    )}

                    {step === 'profile' && (
                        <ProfileStep 
                            formData={formData}
                            setFormData={setFormData}
                            onNext={() => setStep('availability')} 
                        />
                    )}

                    {step === 'availability' && (
                        <AvailabilityStep 
                            formData={formData}
                            setFormData={setFormData}
                            onNext={() => setStep('licenses')} 
                        />
                    )}

                    {step === 'licenses' && (
                        <LicencesStep 
                            formData={formData}
                            setFormData={setFormData}
                            onNext={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {step === 'done' && <SuccessStep />}
                </div>
            </div>
        </div>
    );
}

/* ---------------- STEPPER (NON-CLICKABLE) ---------------- */

function Stepper({
    current,
    profileComplete,
    availabilityComplete,
}: {
    current: Step;
    profileComplete: boolean;
    availabilityComplete: boolean;
}) {
    const steps: { key: Step; label: string; complete: boolean }[] = [
        { key: 'profile', label: 'Profile', complete: profileComplete },
        { key: 'availability', label: 'Availability', complete: availabilityComplete },
        { key: 'licenses', label: 'Licenses', complete: false },
    ];

    const getStepStatus = (stepKey: Step, stepComplete: boolean, index: number) => {
        const currentIndex = steps.findIndex(s => s.key === current);
        
        if (stepKey === current) {
            return 'current';
        }
        
        if (index < currentIndex) {
            return 'completed';
        }
        
        return 'disabled';
    };

    return (
        <div className="flex gap-2 mb-8 bg-gray-100 rounded-lg p-1">
            {steps.map((step, index) => {
                const status = getStepStatus(step.key, step.complete, index);
                const isCurrent = step.key === current;
                const isCompleted = index < steps.findIndex(s => s.key === current);
                const isDisabled = index > steps.findIndex(s => s.key === current);

                return (
                    <div
                        key={step.key}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all text-center cursor-default ${
                            isCurrent
                                ? 'bg-[#268700] text-white'
                                : isCompleted
                                ? 'bg-green-100 text-green-700'
                                : 'text-gray-400 bg-gray-50'
                        }`}
                        title={isDisabled ? 'Complete previous steps to continue' : ''}
                    >
                        {step.label}
                        {isCompleted && (
                            <span className="ml-2">✓</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ---------------- PROFILE ---------------- */

export function ProfileStep({ 
    formData, 
    setFormData, 
    onNext 
}: { 
    formData: FormData;
    setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
    onNext: () => void;
}) {
    const BUSINESS_TYPES = [
        'Bakery',
        'Restaurant',
        'Cloud Kitchen',
        'Catering Company',
        'Home Chef',
    ];

    const handleNext = () => {
        // Validate required fields before proceeding
        if (!formData.business_name || !formData.business_type || !formData.business_description ||
            !formData.service_area || !formData.minimum_guests || !formData.maximum_guests || !formData.preparation_time) {
            alert('Please fill in all required fields');
            return;
        }
        onNext();
    };

    return (
        <div className="space-y-6">
            {/* Business name & type */}
            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Business Name *" 
                    placeholder="Varun Chopra"
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

            {/* Description */}
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                    Description *
                </label>
                <textarea
                    rows={2}
                    placeholder="Describe your catering services..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#268700]"
                    value={formData.business_description}
                    onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                />
            </div>

            {/* Service area */}
            <Input 
                label="Service Area *" 
                placeholder="Abu Dhabi"
                value={formData.service_area}
                onChange={(e) => setFormData({ ...formData, service_area: e.target.value })}
            />

            {/* Guests */}
            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Minimum Guests *" 
                    type="number" 
                    placeholder="12"
                    value={formData.minimum_guests}
                    onChange={(e) => setFormData({ ...formData, minimum_guests: e.target.value })}
                />
                <Input 
                    label="Maximum Guests *" 
                    type="number" 
                    placeholder="23"
                    value={formData.maximum_guests}
                    onChange={(e) => setFormData({ ...formData, maximum_guests: e.target.value })}
                />
            </div>

            {/* Preparation Time */}
            <div className="space-y-1">
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

            {/* Actions */}
            <div className="flex justify-between pt-6">
                <Button variant="outline" className="w-1/2">
                    Save Progress
                </Button>

                <Button
                    onClick={handleNext}
                    className="w-1/2 ml-4 bg-[#268700] hover:bg-[#1f6b00]"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

/* ---------------- AVAILABILITY ---------------- */

function AvailabilityStep({ 
    formData, 
    setFormData, 
    onNext 
}: { 
    formData: FormData;
    setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
    onNext: () => void;
}) {
    const REGION = [
        'Abu Dhabi',
        'Dubai',
        'Sharjah',
        'Ajman',
        'Ras Al Khaimah',
        'Fujairah',
        'Umm Al Quwain',
        'UAE',
    ];

    const handleDeliveryOptionChange = (option: string, checked: boolean) => {
        if (option === 'Delivery Only') {
            setFormData({ ...formData, delivery_only: checked });
        } else if (option === 'Delivery + Setup') {
            setFormData({ ...formData, delivery_plus_setup: checked });
        } else if (option === 'Full Service') {
            setFormData({ ...formData, full_service: checked });
        }
    };

    const handleStaffingChange = (option: string, checked: boolean) => {
        if (option === 'No Staff') {
            // If "No Staff" is checked, set staff to 0, otherwise keep current value
            setFormData({ ...formData, staff: checked ? '0' : (formData.staff || '0') });
        } else if (option === 'Servers') {
            // If "Servers" is checked, set servers to 1 (or prompt for number), otherwise 0
            setFormData({ ...formData, servers: checked ? '1' : '0' });
        }
    };

    return (
        <div className="space-y-6">
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
                    {REGION.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            <CheckboxGroup
                title="Delivery & Setup Options *"
                options={[
                    {
                        label: 'Delivery Only',
                        description: 'Food delivered ready to serve',
                    },
                    {
                        label: 'Delivery + Setup',
                        description: 'We deliver and set up the food display',
                    },
                    {
                        label: 'Full Service',
                        description: 'Includes setup, service, and cleanup',
                    },
                ]}
                selected={[
                    formData.delivery_only ? 'Delivery Only' : '',
                    formData.delivery_plus_setup ? 'Delivery + Setup' : '',
                    formData.full_service ? 'Full Service' : '',
                ].filter(Boolean)}
                onChange={handleDeliveryOptionChange}
            />

            <CheckboxGroup
                title="Staffing Options *"
                options={[
                    {
                        label: 'No Staff',
                        description: 'Food only',
                    },
                    {
                        label: 'Servers',
                        description: 'Additional staff to serve food',
                    },
                ]}
                selected={[
                    formData.staff ? 'No Staff' : '',
                    formData.servers ? 'Servers' : '',
                ].filter(Boolean)}
                onChange={handleStaffingChange}
            />

            <div className="flex justify-between pt-6">
                <Button variant="outline">Save Progress</Button>
                <Button 
                    onClick={() => {
                        // Validate required fields before proceeding
                        if (!formData.region || 
                            (!formData.delivery_only && !formData.delivery_plus_setup && !formData.full_service)) {
                            alert('Please fill in all required fields');
                            return;
                        }
                        onNext();
                    }}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

/* ---------------- LICENCES ---------------- */
type UploadedFile = {
    id: string;
    file: File;
    type: 'food_license' | 'registration';
};
export function LicencesStep({ 
    formData, 
    setFormData, 
    onNext,
    isSubmitting 
}: { 
    formData: FormData;
    setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
    onNext: () => void;
    isSubmitting: boolean;
}) {
    const foodLicenseInputRef = useRef<HTMLInputElement>(null);
    const registrationInputRef = useRef<HTMLInputElement>(null);
    const [foodLicenseFile, setFoodLicenseFile] = useState<File | null>(formData.food_license);
    const [registrationFile, setRegistrationFile] = useState<File | null>(formData.registration);
    const [error, setError] = useState('');

    const MAX_SIZE_MB = 5;

    const validateAndSetFile = (file: File, type: 'food_license' | 'registration') => {
        setError('');

        if (!['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            setError('Only PDF, PNG, or JPG files are allowed');
            return false;
        }

        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError('Each file must be under 5MB');
            return false;
        }

        if (type === 'food_license') {
            setFoodLicenseFile(file);
            setFormData({ ...formData, food_license: file });
        } else {
            setRegistrationFile(file);
            setFormData({ ...formData, registration: file });
        }
        return true;
    };

    const handleFoodLicenseDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) {
            validateAndSetFile(e.dataTransfer.files[0], 'food_license');
        }
    };

    const handleRegistrationDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) {
            validateAndSetFile(e.dataTransfer.files[0], 'registration');
        }
    };

    const removeFoodLicense = () => {
        setFoodLicenseFile(null);
        setFormData({ ...formData, food_license: null });
    };

    const removeRegistration = () => {
        setRegistrationFile(null);
        setFormData({ ...formData, registration: null });
    };

    return (
        <div className="space-y-6">
            {/* Food License */}
            <div>
                <label className="text-sm font-medium text-gray-700">
                    Food License <span className="text-red-500">*</span>
                </label>

                {foodLicenseFile ? (
                    <div className="mt-2 flex items-center justify-between border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded">
                                {foodLicenseFile.type.includes('pdf') ? 'PDF' : 'IMG'}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{foodLicenseFile.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(foodLicenseFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-green-600">✔</span>
                            <button
                                onClick={removeFoodLicense}
                                className="text-gray-400 hover:text-red-500 transition"
                            >
                                🗑
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFoodLicenseDrop}
                        onClick={() => foodLicenseInputRef.current?.click()}
                        className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#268700] transition"
                    >
                        <p className="text-sm text-gray-600">
                            Drop your file here or{' '}
                            <span className="text-[#268700] font-medium">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            JPEG, PNG or PDF (max 5MB)
                        </p>

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
                )}
            </div>

            {/* Registration */}
            <div>
                <label className="text-sm font-medium text-gray-700">
                    Registration <span className="text-red-500">*</span>
                </label>

                {registrationFile ? (
                    <div className="mt-2 flex items-center justify-between border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded">
                                {registrationFile.type.includes('pdf') ? 'PDF' : 'IMG'}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{registrationFile.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(registrationFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-green-600">✔</span>
                            <button
                                onClick={removeRegistration}
                                className="text-gray-400 hover:text-red-500 transition"
                            >
                                🗑
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleRegistrationDrop}
                        onClick={() => registrationInputRef.current?.click()}
                        className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#268700] transition"
                    >
                        <p className="text-sm text-gray-600">
                            Drop your file here or{' '}
                            <span className="text-[#268700] font-medium">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            JPEG, PNG or PDF (max 5MB)
                        </p>

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
                )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {/* Actions */}
            <div className="flex justify-between pt-6">
                <Button variant="outline">Save Progress</Button>
                <Button 
                    onClick={onNext} 
                    disabled={!foodLicenseFile || !registrationFile || isSubmitting}
                    isLoading={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
            </div>
        </div>
    );
}

/* ---------------- SUCCESS ---------------- */

function SuccessStep() {
    const router = useRouter();
    const { refreshUser } = useAuth();

    const handleGoToDashboard = async () => {
        // Refresh user data to get updated profile_completed status
        await refreshUser();
        // Redirect to dashboard
        router.replace('/caterer/dashboard');
    };

    return (
        <div className="text-center py-12 space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-4xl">
                ✓
            </div>

            <h2 className="text-xl font-semibold">
                Your Profile has been Sent for Review
            </h2>

            <p className="text-gray-500 max-w-md mx-auto">
                Our team will review your details and notify you once approved.
            </p>
            <Button 
                className="mt-6" 
                onClick={handleGoToDashboard}
            >
                Go to Dashboard
            </Button>

        </div>
    );
}

/* ---------------- CHECKBOX GROUP ---------------- */

type Option = {
    label: string;
    description?: string;
};

function CheckboxGroup({
    title,
    options,
    selected = [],
    onChange,
}: {
    title: string;
    options: Option[];
    selected?: string[];
    onChange?: (label: string, checked: boolean) => void;
}) {
    const [internalSelected, setInternalSelected] = useState<string[]>(selected);

    // Use controlled selection if onChange is provided, otherwise use internal state
    const isControlled = onChange !== undefined;
    const currentSelected = isControlled ? selected : internalSelected;

    // Sync internal state when selected prop changes (for uncontrolled mode)
    useEffect(() => {
        if (!isControlled) {
            setInternalSelected(selected);
        }
    }, [selected, isControlled]);

    const toggle = (label: string) => {
        const isChecked = currentSelected.includes(label);
        
        if (isControlled && onChange) {
            onChange(label, !isChecked);
        } else {
            setInternalSelected((prev) =>
                prev.includes(label)
                    ? prev.filter((v) => v !== label)
                    : [...prev, label]
            );
        }
    };

    return (
        <div className="space-y-4">
            {/* Group title */}
            <h3 className="text-sm font-medium text-gray-800">{title}</h3>

            <div className="space-y-4">
                {options.map((opt) => (
                    <label
                        key={opt.label}
                        className="flex items-start gap-3 cursor-pointer"
                    >
                        {/* Checkbox */}
                        <input
                            type="checkbox"
                            checked={currentSelected.includes(opt.label)}
                            onChange={() => toggle(opt.label)}
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-[#268700] focus:ring-[#268700]"
                        />

                        {/* Label + description */}
                        <div className="leading-tight">
                            <p className="text-sm font-medium text-gray-900">
                                {opt.label}
                            </p>
                            {opt.description && (
                                <p className="text-sm text-gray-500">
                                    {opt.description}
                                </p>
                            )}
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}
