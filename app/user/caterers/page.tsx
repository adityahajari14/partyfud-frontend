'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { userApi, type Caterer } from '@/lib/api/user.api';

export default function BrowseCaterersPage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('Dubai');
  const [guests, setGuests] = useState<number | undefined>(undefined);
  const [date, setDate] = useState('');
  const [budget, setBudget] = useState(160);
  const [menuType, setMenuType] = useState({
    fixed: true,
    customizable: true,
    liveStations: true,
  });
  const [caterers, setCaterers] = useState<Caterer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get logo text and background from name
  const getLogoInfo = (name: string) => {
    const words = name.split(' ');
    const logoText = words.length > 1 
      ? words[0].substring(0, 5).toUpperCase() 
      : name.substring(0, 5).toUpperCase();
    const colors = ['bg-orange-500', 'bg-green-700', 'bg-black', 'bg-blue-500', 'bg-purple-500'];
    const colorIndex = name.length % colors.length;
    return { logoText, logoBg: colors[colorIndex] };
  };

  // Fetch caterers when filters change
  useEffect(() => {
    const fetchCaterers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await userApi.filterCaterers({
          location: location !== 'All' ? location : undefined,
          guests,
          date: date || undefined,
          maxBudget: budget,
          menuType: {
            fixed: menuType.fixed,
            customizable: menuType.customizable,
            liveStations: menuType.liveStations,
          },
          search: search || undefined,
        });

        if (response.error) {
          setError(response.error);
          setCaterers([]);
        } else if (response.data?.data) {
          setCaterers(response.data.data);
        }
      } catch (err) {
        setError('Failed to fetch caterers');
        setCaterers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCaterers();
  }, [search, location, guests, date, budget, menuType]);

  return (
    <section className="bg-[#FAFAFA] min-h-screen">
      <h1 className='mt-5 ml-36 text-3xl font-semibold'>Browse from Caterers</h1>
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">

        {/* LEFT FILTERS */}
        <aside className="bg-white border border-gray-200 rounded-xl p-4 h-fit">

          <div className="flex justify-between mb-4">
            <h3 className="font-medium">Filters</h3>
            <button
              className="text-sm text-gray-500 border border-gray-200 px-2 py-1 cursor-pointer rounded-xl hover:bg-gray-100"
              onClick={() => {
                setSearch('');
                setLocation('Dubai');
                setGuests(undefined);
                setDate('');
                setBudget(160);
                setMenuType({ fixed: true, customizable: true, liveStations: true });
              }}
            >
              Clear
            </button>
          </div>

          <label className="text-sm text-gray-500">Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 mb-4"
          >
            <option>All</option>
            <option>Dubai</option>
            <option>Abu Dhabi</option>
          </select>

          <label className="text-sm text-gray-500">Guests</label>
          <select 
            value={guests || ''}
            onChange={(e) => setGuests(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 mb-4"
          >
            <option value="">All</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="120">120</option>
            <option value="200">200</option>
            <option value="300">300</option>
            <option value="500">500</option>
          </select>

          <label className="text-sm text-gray-500">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 mb-4"
          />

          <label className="text-sm text-gray-500">Budget (Per Person)</label>
          <input
            type="range"
            min={100}
            max={300}
            step={10}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full mt-2"
          />
          <p className="text-sm mt-1">AED 120 – AED {budget}</p>

          <div className="mt-4 space-y-2 text-sm">
            <label className="font-medium">Menu Type</label>

            <label className="flex gap-2">
              <input
                type="checkbox"
                // checked={menuType.fixed}
                onChange={(e) =>
                  setMenuType({ ...menuType, fixed: e.target.checked })
                }
              />
              Fixed
            </label>

            <label className="flex gap-2">
              <input
                type="checkbox"
                // checked={menuType.customizable}
                onChange={(e) =>
                  setMenuType({ ...menuType, customizable: e.target.checked })
                }
              />
              Customizable
            </label>

            <label className="flex gap-2">
              <input
                type="checkbox"
                // checked={menuType.liveStations}
                onChange={(e) =>
                  setMenuType({ ...menuType, liveStations: e.target.checked })
                }
              />
              Live Stations
            </label>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a Package, Food Item"
              className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2"
            />
            <select className="bg-white border border-gray-200 rounded-lg px-3 py-2">
              <option>Recommended</option>
              <option>Rating</option>
            </select>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading caterers...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {/* Caterer Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {caterers.length === 0 ? (
                <div className="col-span-3 text-center py-10">
                  <p className="text-gray-500">No caterers found matching your filters.</p>
                </div>
              ) : (
                caterers.map((c) => {
                  const { logoText, logoBg } = getLogoInfo(c.name);
                  return (
                    <div
                      key={c.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold ${logoBg}`}
                        >
                          {logoText}
                        </div>
                        <div>
                          <h4 className="font-medium">{c.name}</h4>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {c.cuisines.map((cu) => (
                              <span
                                key={cu}
                                className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                              >
                                {cu}
                              </span>
                            ))}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            ⭐ {c.packages.length > 0 ? (c.packages[0]?.rating || 'N/A') : 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <span className="font-semibold text-sm">
                          {c.priceRange}
                        </span>
                        <Link
                          href={`/user/caterers/${c.id}`}
                          className="bg-green-600 text-white text-xs px-3 py-1 rounded-full hover:opacity-90"
                        >
                          View Menu
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}