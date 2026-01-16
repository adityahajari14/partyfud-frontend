'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessProfile } from '@/components/caterer/onboarding/BusinessProfile';
import { MenuTypeSelection } from '@/components/caterer/onboarding/MenuTypeSelection';
import { AvailabilityLogistics } from '@/components/caterer/onboarding/AvailabilityLogistics';
import { PreviewPublish } from '@/components/caterer/onboarding/PreviewPublish';
import Link from 'next/link';
import Image from 'next/image';

type OnboardingStep = 1 | 2 | 3 | 4;

interface OnboardingData {
  // Step 1 - Business Profile
  business_name: string;
  business_type: string;
  business_description: string;
  service_area: string;
  region: string;
  minimum_guests: number;
  maximum_guests: number;
  cuisine_types: string[];
  certifications: string[];

  // Step 2 - Menu Types
  delivery_only: boolean;
  delivery_plus_setup: boolean;
  full_service: boolean;

  // Step 3 - Availability & Logistics
  preparation_time: number;
  staff: number;
  servers: number;
  unavailable_dates: string[];
}

const STEPS = [
  { number: 1, name: 'Profile', icon: '👤' },
  { number: 2, name: 'Menu Type', icon: '📋' },
  { number: 3, name: 'Availability', icon: '📅' },
  { number: 4, name: 'Preview', icon: '👁️' },
] as const;

export default function CatererOnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    business_name: '',
    business_type: '',
    business_description: '',
    service_area: '',
    region: '',
    minimum_guests: 50,
    maximum_guests: 500,
    cuisine_types: [],
    certifications: [],
    delivery_only: true,
    delivery_plus_setup: true,
    full_service: false,
    preparation_time: 24,
    staff: 0,
    servers: 0,
    unavailable_dates: [],
  });

  // Load existing draft data on mount
  useEffect(() => {
    const loadDraftData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setIsLoadingDraft(false);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/caterer/onboarding/status`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const draftData = result.data;
            
            // Map the backend data to frontend state
            setOnboardingData({
              business_name: draftData.business_name || '',
              business_type: draftData.business_type || '',
              business_description: draftData.business_description || '',
              service_area: draftData.service_area || '',
              region: draftData.region || '',
              minimum_guests: draftData.minimum_guests || 50,
              maximum_guests: draftData.maximum_guests || 500,
              cuisine_types: draftData.cuisine_types || [],
              certifications: draftData.certifications || [],
              delivery_only: draftData.delivery_only ?? true,
              delivery_plus_setup: draftData.delivery_plus_setup ?? true,
              full_service: draftData.full_service ?? false,
              preparation_time: draftData.preparation_time || 24,
              staff: draftData.staff || 0,
              servers: draftData.servers || 0,
              unavailable_dates: draftData.unavailable_dates || [],
            });
          }
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      } finally {
        setIsLoadingDraft(false);
      }
    };

    loadDraftData();
  }, []);

  const progress = (currentStep / 4) * 100;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  const updateData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  // Show loading state while fetching draft
  if (isLoadingDraft) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your onboarding data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <p className='font-bold text-xl'>Partner Onboarding</p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Step {currentStep} of {STEPS.length}
              </span>
              <span className="text-sm font-medium text-green-600">{progress}% Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="relative">
            <div className="overflow-hidden h-2 bg-gray-100">
              <div
                className="h-full bg-green-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between py-4">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className={`flex flex-col items-center ${
                  step.number <= currentStep ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1 ${
                    step.number <= currentStep
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          {/* Loading state */}
          {isLoadingDraft ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Step Content */}
              {currentStep === 1 && (
                <BusinessProfile
                  data={onboardingData}
                  updateData={updateData}
                  onNext={handleNext}
                />
              )}

              {currentStep === 2 && (
                <MenuTypeSelection
                  data={onboardingData}
                  updateData={updateData}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 3 && (
                <AvailabilityLogistics
                  data={onboardingData}
                  updateData={updateData}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 4 && (
                <PreviewPublish
                  data={onboardingData}
                  onBack={handleBack}
                  onSubmitSuccess={refreshUser}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
