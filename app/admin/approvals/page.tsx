'use client';

import React, { useState, useMemo } from 'react';

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

const DATA: Caterer[] = [
  {
    id: '1',
    name: 'Gourmet Bites Bistro',
    type: 'Cafe',
    city: 'Dubai',
    cuisines: ['French', 'Mediterranean', 'Sushi', 'Desserts'],
    email: 'info@gourmetbites.com',
    phone: '+971 50 123 4567',
    registered: '11/15/2025',
    status: 'pending',
  },
  {
    id: '2',
    name: 'Spice Route Kitchen',
    type: 'Restaurant',
    city: 'Doha',
    cuisines: ['Thai', 'South Asian', 'Barbecue', 'Seafood', 'Fusion'],
    email: 'contact@spiceroute.com',
    phone: '+974 1234 5678',
    registered: '01/10/2023',
    status: 'pending',
  },
  {
    id: '3',
    name: 'Urban Eats Food Truck',
    type: 'Food Truck',
    city: 'Riyadh',
    cuisines: ['American', 'BBQ', 'Street Food', 'Desserts'],
    email: 'info@urbaneats.com',
    phone: '+966 54 987 6543',
    registered: '09/30/2025',
    status: 'pending',
  },
  {
    id: '4',
    name: 'Royal Flavors Catering',
    type: 'Restaurant',
    city: 'Abu Dhabi',
    cuisines: ['Italian', 'Indian', 'Chinese', 'Mexican'],
    email: 'amit@royalflavors.com',
    phone: '+91 98765 11111',
    registered: '12/28/2024',
    status: 'pending',
  },
];

export default function ApprovalsDashboard() {
  const [items, setItems] = useState<Caterer[]>(DATA);
  const [tab, setTab] = useState<Status>('pending');
  const [search, setSearch] = useState('');

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

  const updateStatus = (id: string, status: Status) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <h1 className="text-2xl font-bold">Approvals Dashboard</h1>

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

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border p-4 shadow-sm space-y-3"
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

              {/* Cuisines */}
              <div className="flex flex-wrap gap-2">
                {c.cuisines.slice(0, 4).map((cu) => (
                  <span
                    key={cu}
                    className="text-xs px-2 py-1 border border-green-500 text-green-700 rounded-full"
                  >
                    {cu}
                  </span>
                ))}
                {c.cuisines.length > 4 && (
                  <span className="text-xs px-2 py-1 border rounded-full text-green-700">
                    +{c.cuisines.length - 4}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="text-xs text-gray-600 space-y-1">
                <p>Email: {c.email}</p>
                <p>Phone: {c.phone}</p>
                <p>Registered: {c.registered}</p>
              </div>

              {/* Actions */}
              {c.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => updateStatus(c.id, 'approved')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(c.id, 'rejected')}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
