'use client';

import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { useState } from 'react';

interface AvailabilityLogisticsProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const LEAD_TIMES = [
  { value: 12, label: '12 hours' },
  { value: 24, label: '24 hours' },
  { value: 48, label: '2 days' },
  { value: 72, label: '3 days' },
  { value: 168, label: '1 week' },
];

const DELIVERY_OPTIONS = [
  {
    id: 'delivery_only_service',
    title: 'Delivery Only',
    description: 'Food delivered ready to serve',
    icon: '🚚',
  },
  {
    id: 'delivery_plus_setup_service',
    title: 'Delivery + Setup',
    description: 'We deliver and set up the food display',
    icon: '🎨',
  },
  {
    id: 'full_service_option',
    title: 'Full Service',
    description: 'Includes setup, service, and cleanup',
    icon: '✨',
  },
];

const STAFFING_OPTIONS = [
  {
    id: 'no_staff',
    title: 'No Staff',
    description: 'Food only',
    icon: '🍱',
  },
  {
    id: 'servers_available',
    title: 'Servers Available',
    description: 'Additional cost per server',
    icon: '🧑‍🍳',
  },
  {
    id: 'chef_on_site',
    title: 'Chef on Site',
    description: 'Chef prepares and/or serves on location',
    icon: '👨‍🍳',
  },
];

export function AvailabilityLogistics({
  data,
  updateData,
  onNext,
  onBack,
}: AvailabilityLogisticsProps) {
  const [selectedDelivery, setSelectedDelivery] = useState<string[]>([]);
  const [selectedStaffing, setSelectedStaffing] = useState<string[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>(data.unavailable_dates || []);

  const toggleDeliveryOption = (id: string) => {
    if (selectedDelivery.includes(id)) {
      setSelectedDelivery(selectedDelivery.filter((item) => item !== id));
    } else {
      setSelectedDelivery([...selectedDelivery, id]);
    }
  };

  const toggleStaffingOption = (id: string) => {
    if (selectedStaffing.includes(id)) {
      setSelectedStaffing(selectedStaffing.filter((item) => item !== id));
    } else {
      setSelectedStaffing([...selectedStaffing, id]);
    }
  };

  const handleNext = () => {
    // Map staffing selections to staff/servers numbers
    const staffCount = selectedStaffing.includes('servers_available') ? 1 : 0;
    const serversCount = selectedStaffing.includes('chef_on_site') ? 1 : 0;

    updateData({
      staff: staffCount,
      servers: serversCount,
      unavailable_dates: unavailableDates,
    });

    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Availability & Logistics</h2>
        <p className="text-gray-600">Set your service parameters and availability</p>
      </div>

      {/* Lead Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Lead Time Required <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Minimum notice required before an event
        </p>
        <select
          value={data.preparation_time}
          onChange={(e) => updateData({ preparation_time: parseInt(e.target.value) })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          {LEAD_TIMES.map((time) => (
            <option key={time.value} value={time.value}>
              {time.label}
            </option>
          ))}
        </select>
      </div>

      {/* Delivery & Setup Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Delivery & Setup Options <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {DELIVERY_OPTIONS.map((option) => {
            const selected = selectedDelivery.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleDeliveryOption(option.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition ${
                  selected
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selected
                          ? 'bg-green-500 border-green-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {selected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{option.icon}</span>
                      <h4 className="font-medium text-gray-900">{option.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Staffing Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Staffing Options
        </label>
        <div className="space-y-3">
          {STAFFING_OPTIONS.map((option) => {
            const selected = selectedStaffing.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleStaffingOption(option.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition ${
                  selected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selected
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {selected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{option.icon}</span>
                      <h4 className="font-medium text-gray-900">{option.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Unavailable Dates */}
      <div>
        <DatePicker
          selectedDates={unavailableDates}
          onDatesChange={setUnavailableDates}
          label="Unavailable Dates"
          minDate={new Date().toISOString().split('T')[0]}
        />
        <p className="text-sm text-gray-600 mt-2">
          Click on dates to block them from booking. You can update this calendar anytime after onboarding.
        </p>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={handleNext} disabled={selectedDelivery.length === 0}>
          Continue to Preview →
        </Button>
      </div>
    </div>
  );
}
