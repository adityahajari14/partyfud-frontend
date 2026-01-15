'use client';

import { useState, useEffect } from 'react';
import { DUBAI_LOCATIONS, getMinEventDate } from '@/lib/constants';

interface Occasion {
  id: string;
  name: string;
}

interface EventDetailsFormProps {
  eventType: string;
  setEventType: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  guestCount: number;
  setGuestCount: (value: number) => void;
  eventDate: string;
  setEventDate: (value: string) => void;
  occasions: Occasion[];
  loadingOccasions?: boolean;
  minGuests?: number;
  maxGuests?: number;
  estimatedTotal?: number;
  className?: string;
}

export function EventDetailsForm({
  eventType,
  setEventType,
  location,
  setLocation,
  guestCount,
  setGuestCount,
  eventDate,
  setEventDate,
  occasions,
  loadingOccasions = false,
  minGuests,
  maxGuests,
  estimatedTotal,
  className = '',
}: EventDetailsFormProps) {
  const minDate = getMinEventDate();

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}>
      <h3 className="font-semibold text-lg mb-4 text-gray-900">Event Details</h3>

      {/* Event Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Type <span className="text-red-500">*</span>
        </label>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          disabled={loadingOccasions}
        >
          <option value="">
            {loadingOccasions ? 'Loading...' : 'Select Event Type'}
          </option>
          {occasions.map((occasion) => (
            <option key={occasion.id} value={occasion.id}>
              {occasion.name}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location <span className="text-red-500">*</span>
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        >
          <option value="">Select Location</option>
          {DUBAI_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Number of Guests */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Guests <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min={minGuests || 1}
          max={maxGuests}
          value={guestCount || ''}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= 0) {
              setGuestCount(value);
            }
          }}
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          placeholder="Enter number of guests"
        />
        {(minGuests || maxGuests) && (
          <p className="text-xs text-gray-500 mt-1">
            {minGuests && maxGuests
              ? `${minGuests} - ${maxGuests} guests`
              : minGuests
              ? `Minimum ${minGuests} guests`
              : `Maximum ${maxGuests} guests`}
          </p>
        )}
      </div>

      {/* Event Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          min={minDate}
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
      </div>

      {/* Estimated Total */}
      {estimatedTotal !== undefined && estimatedTotal > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Estimated Total</span>
            <span className="text-xl font-bold text-gray-900">
              AED {estimatedTotal.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            For {guestCount} {guestCount === 1 ? 'guest' : 'guests'}
          </p>
        </div>
      )}
    </div>
  );
}
