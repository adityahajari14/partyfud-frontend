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
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <h1 className="text-2xl font-bold">Approvals Dashboard</h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Search + Tabs */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            placeholder="Search for Caterers"
            className="flex-1 min-w-65 border rounded-lg px-4 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {(['pending', 'approved', 'rejected'] as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                tab === s
                  ? s === 'pending'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-900 text-white'
                  : 'bg-white border'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading caterer information...</p>
          </div>
        )}

        {/* Cards */}
        {!loading && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {search ? 'No caterers found matching your search.' : `No ${tab} caterers found.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl border p-4 shadow-sm space-y-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/admin/approvals/${c.id}`)}
                  >
                    {/* Header */}
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{c.name}</h3>
                        <p className="text-sm text-gray-500">{c.type}</p>
                        <p className="text-xs text-gray-500">📍 {c.city}</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                        {c.status}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Email: {c.email}</p>
                      <p>Phone: {c.phone}</p>
                      <p>Registered: {c.registered}</p>
                    </div>

                    {/* Actions */}
                    {c.status === 'pending' && (
                      <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => updateStatus(c.id, 'approved')}
                          disabled={updating === c.id}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
                        >
                          {updating === c.id ? 'Updating...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => updateStatus(c.id, 'rejected')}
                          disabled={updating === c.id}
                          className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600"
                        >
                          {updating === c.id ? 'Updating...' : 'Reject'}
                        </button>
                      </div>
                    )}
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
