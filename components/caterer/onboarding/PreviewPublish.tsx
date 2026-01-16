'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface PreviewPublishProps {
  data: any;
  onBack: () => void;
  onDraftSaved?: () => void;
  onSubmitSuccess?: () => void;
}

export function PreviewPublish({ data, onBack, onDraftSaved, onSubmitSuccess }: PreviewPublishProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaveMessage, setDraftSaveMessage] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    // Fetch cuisine types to display names instead of IDs
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/occasions/cuisines`)
      .then((res) => res.json())
      .then((response) => {
        if (response.data) {
          setCuisineTypes(response.data);
        }
      })
      .catch((err) => console.error('Error fetching cuisines:', err));
  }, []);

  const getCuisineName = (cuisineId: string) => {
    const cuisine = cuisineTypes.find(c => c.id === cuisineId);
    return cuisine ? cuisine.name : cuisineId;
  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      setDraftSaveMessage('');
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/caterer/onboarding/save-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save draft');

      setDraftSaveMessage('Draft saved successfully!');
      if (onDraftSaved) onDraftSaved();
      
      // Clear message after 3 seconds
      setTimeout(() => setDraftSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
      setDraftSaveMessage('Failed to save draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/caterer/onboarding/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to submit');

      alert(
        'Application submitted successfully! Our team will review your profile and get back to you within 2-3 business days.'
      );
      // Refresh user data to update their type to CATERER
      if (onSubmitSuccess) await onSubmitSuccess();
      router.push('/caterer/dashboard');
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
        <p className="text-gray-600">
          Review your information before submitting for approval
        </p>
      </div>

      {/* Business Profile Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🏢</span> Business Profile
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Business Name</p>
              <p className="font-medium text-gray-900">{data.business_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Business Type</p>
              <p className="font-medium text-gray-900">{data.business_type || 'N/A'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium text-gray-900">{data.business_description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Service Area</p>
              <p className="font-medium text-gray-900">{data.region}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Guest Capacity</p>
              <p className="font-medium text-gray-900">
                {data.minimum_guests} - {data.maximum_guests} guests
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Cuisines</p>
            <div className="flex flex-wrap gap-2">
              {data.cuisine_types?.map((cuisineId: string) => (
                <span
                  key={cuisineId}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {getCuisineName(cuisineId)}
                </span>
              ))}
            </div>
          </div>
          {data.certifications && data.certifications.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Certifications</p>
              <div className="flex flex-wrap gap-2">
                {data.certifications.map((cert: string) => (
                  <span
                    key={cert}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Types Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📋</span> Menu Types
        </h3>
        <div className="space-y-2">
          {data.delivery_only && (
            <div className="flex items-center gap-2 text-gray-700">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Set Menus - Pre-designed menu packages</span>
            </div>
          )}
          {data.delivery_plus_setup && (
            <div className="flex items-center gap-2 text-gray-700">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Build-Your-Own - Customers customize from menu items</span>
            </div>
          )}
          {data.full_service && (
            <div className="flex items-center gap-2 text-gray-700">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Custom Catering - Bespoke menus for special events</span>
            </div>
          )}
        </div>
      </div>

      {/* Availability & Logistics Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>⚙️</span> Availability & Logistics
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Lead Time Required</p>
            <p className="font-medium text-gray-900">
              {data.preparation_time >= 168
                ? `${data.preparation_time / 168} week${data.preparation_time / 168 > 1 ? 's' : ''}`
                : data.preparation_time >= 24
                ? `${data.preparation_time / 24} day${data.preparation_time / 24 > 1 ? 's' : ''}`
                : `${data.preparation_time} hours`}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Service Options</p>
            <div className="flex flex-wrap gap-2">
              {data.staff > 0 && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  Staff Available
                </span>
              )}
              {data.servers > 0 && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  Servers Available
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-yellow-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-yellow-800 mb-1">Pending Approval</h4>
            <p className="text-sm text-yellow-700">
              After submission, our team will review your profile. You'll be notified via
              email once approved. During this time, you won't be able to create packages
              or receive orders.
            </p>
          </div>
        </div>
      </div>

      {/* Draft Save Message */}
      {draftSaveMessage && (
        <div className={`rounded-lg p-4 ${
          draftSaveMessage.includes('Failed') 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <p className={`text-sm font-medium ${
            draftSaveMessage.includes('Failed') ? 'text-red-700' : 'text-green-700'
          }`}>
            {draftSaveMessage}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting || isSavingDraft}>
          ← Back
        </Button>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleSaveDraft} 
            disabled={isSubmitting || isSavingDraft}
          >
            {isSavingDraft ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isSavingDraft}>
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </div>
      </div>
    </div>
  );
}
