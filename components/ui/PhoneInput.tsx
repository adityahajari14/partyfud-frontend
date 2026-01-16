'use client';

import { useState } from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

const COUNTRY_CODES = [
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+966', country: 'Saudi', flag: '🇸🇦' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
];

export function PhoneInput({
  value,
  onChange,
  label,
  error,
  required = false,
  placeholder = '50 123 4567',
}: PhoneInputProps) {
  // Parse the value to extract country code and number
  const getInitialValues = () => {
    if (!value) return { countryCode: '+971', phoneNumber: '' };
    
    // Find matching country code
    const matchingCode = COUNTRY_CODES.find(c => value.startsWith(c.code));
    if (matchingCode) {
      return {
        countryCode: matchingCode.code,
        phoneNumber: value.slice(matchingCode.code.length).trim(),
      };
    }
    
    return { countryCode: '+971', phoneNumber: value };
  };

  const { countryCode: initialCode, phoneNumber: initialNumber } = getInitialValues();
  const [countryCode, setCountryCode] = useState(initialCode);
  const [phoneNumber, setPhoneNumber] = useState(initialNumber);

  const handleCountryCodeChange = (newCode: string) => {
    setCountryCode(newCode);
    onChange(`${newCode}${phoneNumber}`);
  };

  const handlePhoneNumberChange = (newNumber: string) => {
    // Allow only digits and spaces
    const cleaned = newNumber.replace(/[^\d\s]/g, '');
    setPhoneNumber(cleaned);
    onChange(`${countryCode}${cleaned}`);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex gap-2">
        {/* Country Code Selector */}
        <div className="relative">
          <select
            value={countryCode}
            onChange={(e) => handleCountryCodeChange(e.target.value)}
            className="appearance-none w-32 px-3 py-2.5 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm cursor-pointer"
          >
            {COUNTRY_CODES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.code}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => handlePhoneNumberChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
