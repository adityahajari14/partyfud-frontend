'use client';

import { X, Check, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  const Icon = {
    success: Check,
    error: AlertCircle,
    info: AlertCircle,
  }[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-72 max-w-md`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="flex-1 text-sm">{message}</span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Hook for managing toast notifications
import { useState, useCallback } from 'react';

export interface ToastState {
  type: 'success' | 'error' | 'info';
  message: string;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((type: ToastState['type'], message: string) => {
    setToast({ type, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}
