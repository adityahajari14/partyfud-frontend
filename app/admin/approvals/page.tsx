'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin.api';

type Status = 'pending' | 'approved' | 'rejected';

interface Caterer {
  id: string;
  name: string;
  type: string;
  city: string;
  cuisines: string[];
  email: string;
  phone: string;
  registered: string;
  status: Status;
}

// Map backend status to frontend status
const mapStatus = (backendStatus: string): Status => {
  const statusMap: Record<string, Status> = {
    'PENDING': 'pending',
    'APPROVED': 'approved',
    'REJECTED': 'rejected',
    'BLOCKED': 'rejected', // Map BLOCKED to rejected for UI
  };
  return statusMap[backendStatus] || 'pending';
};

// Map backend status to frontend status (reverse for API calls)
const mapStatusToBackend = (frontendStatus: Status): 'PENDING' | 'APPROVED' | 'REJECTED' => {
  const statusMap: Record<Status, 'PENDING' | 'APPROVED' | 'REJECTED'> = {
    'pending': 'PENDING',
    'approved': 'APPROVED',
    'rejected': 'REJECTED',
  };
  return statusMap[frontendStatus];
};

export default function ApprovalsDashboard() {
  const router = useRouter();
  const [items, setItems] = useState<Caterer[]>([]);
  const [tab, setTab] = useState<Status>('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Fetch all caterer info and group by status
  useEffect(() => {
    const fetchCatererInfo = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all statuses
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          adminApi.getCatererInfo('PENDING'),
          adminApi.getCatererInfo('APPROVED'),
          adminApi.getCatererInfo('REJECTED'),
        ]);

        const allItems: Caterer[] = [];

        // Process pending
        if (pendingRes.data?.success && pendingRes.data.data) {
          pendingRes.data.data.forEach((item) => {
            allItems.push({
              id: item.id,
              name: item.business_name,
              type: item.business_type,
              city: item.region || item.service_area || 'N/A',
              cuisines: [], // Backend doesn't have cuisines field
              email: item.caterer.email,
              phone: item.caterer.phone,
              registered: new Date(item.created_at).toLocaleDateString(),
              status: mapStatus(item.status),
            });
          });
        }

        // Process approved
        if (approvedRes.data?.success && approvedRes.data.data) {
          approvedRes.data.data.forEach((item) => {
            allItems.push({
              id: item.id,
              name: item.business_name,
              type: item.business_type,
              city: item.region || item.service_area || 'N/A',
              cuisines: [],
              email: item.caterer.email,
              phone: item.caterer.phone,
              registered: new Date(item.created_at).toLocaleDateString(),
              status: mapStatus(item.status),
            });
          });
        }

        // Process rejected
        if (rejectedRes.data?.success && rejectedRes.data.data) {
          rejectedRes.data.data.forEach((item) => {
            allItems.push({
              id: item.id,
              name: item.business_name,
              type: item.business_type,
              city: item.region || item.service_area || 'N/A',
              cuisines: [],
              email: item.caterer.email,
              phone: item.caterer.phone,
              registered: new Date(item.created_at).toLocaleDateString(),
              status: mapStatus(item.status),
            });
          });
        }

        setItems(allItems);
      } catch (err) {
        console.error('Error fetching caterer info:', err);
        setError('Failed to load caterer information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatererInfo();
  }, []);

  const filtered = useMemo(() => {
    return items.filter(
      (c) =>
        c.status === tab &&
        c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, tab, search]);

  const counts = {
    pending: items.filter((i) => i.status === 'pending').length,
    approved: items.filter((i) => i.status === 'approved').length,
    rejected: items.filter((i) => i.status === 'rejected').length,
  };

  const updateStatus = async (id: string, status: Status) => {
    setUpdating(id);
    try {
      const backendStatus = mapStatusToBackend(status);
      const response = await adminApi.updateCatererInfoStatus(id, backendStatus);

      if (response.error) {
        console.error('Error updating status:', response.error);
        setError(`Failed to update status: ${response.error}`);
        setUpdating(null);
        return;
      }

      // Update local state
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status } : i))
      );
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <main className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900">Approvals Dashboard</h1>
          <p className="text-gray-600 mt-2 text-sm">Review and manage caterer approval requests</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-lg shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-4 text-red-500 hover:text-red-700 font-bold text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Search + Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1 w-full md:w-auto">
              <input
                placeholder="Search for Caterers"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#268700] focus:border-transparent transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex flex-wrap gap-3">
              {(['pending', 'approved', 'rejected'] as Status[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setTab(s)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    tab === s
                      ? 'bg-[#268700] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-gray-600"></div>
            <p className="text-gray-600 mt-4 text-sm font-medium">Loading caterer information...</p>
          </div>
        )}

        {/* Cards */}
        {!loading && (
          <>
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500 text-base">
                  {search ? 'No caterers found matching your search.' : `No ${tab} caterers found.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl shadow-sm p-6 space-y-4 cursor-pointer hover:shadow-lg transition-all border border-gray-100 hover:border-gray-200"
                    onClick={() => router.push(`/admin/approvals/${c.id}`)}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{c.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{c.type}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span>📍</span>
                          <span>{c.city}</span>
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide ${
                        c.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : c.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium w-16">Email:</span>
                        <span className="truncate">{c.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium w-16">Phone:</span>
                        <span>{c.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium w-16">Registered:</span>
                        <span>{c.registered}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
