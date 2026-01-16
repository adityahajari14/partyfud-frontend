'use client';

import { useState } from 'react';

interface DatePickerProps {
  selectedDates?: string[]; // Array of ISO date strings
  onDatesChange?: (dates: string[]) => void;
  label?: string;
  minDate?: string; // ISO date string
}

export function DatePicker({
  selectedDates = [],
  onDatesChange,
  label,
  minDate,
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set(selectedDates));

  const toggleDate = (dateStr: string) => {
    const newBlockedDates = new Set(blockedDates);
    if (newBlockedDates.has(dateStr)) {
      newBlockedDates.delete(dateStr);
    } else {
      newBlockedDates.add(dateStr);
    }
    setBlockedDates(newBlockedDates);
    onDatesChange?.(Array.from(newBlockedDates));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const formatDateString = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  };

  const isDateBlocked = (year: number, month: number, day: number) => {
    const dateStr = formatDateString(year, month, day);
    return blockedDates.has(dateStr);
  };

  const isDateDisabled = (year: number, month: number, day: number) => {
    if (!minDate) return false;
    const dateStr = formatDateString(year, month, day);
    return dateStr < minDate;
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      {label && <h3 className="text-sm font-medium text-gray-700 mb-3">{label}</h3>}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h4 className="text-lg font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h4>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const isBlocked = isDateBlocked(year, month, day);
            const isDisabled = isDateDisabled(year, month, day);

            return (
              <button
                key={day}
                type="button"
                onClick={() => !isDisabled && toggleDate(formatDateString(year, month, day))}
                disabled={isDisabled}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition ${
                  isDisabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : isBlocked
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 rounded"></div>
            <span>Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
            <span>Available</span>
          </div>
        </div>

        {blockedDates.size > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              {blockedDates.size} {blockedDates.size === 1 ? 'date' : 'dates'} blocked
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
