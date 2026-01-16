'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { userApi, type Caterer } from '@/lib/api/user.api';

export default function BrowseCaterersPage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('All');
  const [guests, setGuests] = useState<number | undefined>(undefined);
  const [date, setDate] = useState('');
  const [budget, setBudget] = useState(500);
  const [menuType, setMenuType] = useState({
    fixed: true,
    customizable: true,
    liveStations: true,
  });
  const [caterers, setCaterers] = useState<Caterer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
          maxBudget: budget < 500 ? budget : undefined,
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
          const fetchedCaterers = response.data.data;
          setCaterers(fetchedCaterers);

          // Check if any caterer has customizable packages and update checkbox state
          // Only update if customizable is currently false and we have customizable packages
          const hasCustomizablePackages = fetchedCaterers.some((caterer: Caterer) =>
            caterer.packages?.some((pkg: any) =>
              pkg.customisation_type === 'CUSTOMISABLE' || pkg.customisation_type === 'CUSTOMIZABLE'
            )
          );

          // Only update if the value would actually change to prevent infinite loop
          if (hasCustomizablePackages && !menuType.customizable) {
            setMenuType(prev => ({ ...prev, customizable: true }));
          }
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
    <section className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-semibold text-gray-900 mb-10">Browse Caterers</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* LEFT FILTERS */}
          <aside className="bg-gray-50 rounded-2xl p-6 h-fit border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => {
                  setSearch('');
                  setLocation('All');
                  setGuests(undefined);
                  setDate('');
                  setBudget(500);
                  setMenuType({ fixed: true, customizable: true, liveStations: true });
                }}
              >
                Clear
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#268700] focus:border-transparent"
                >
                  <option>All</option>
                  <option>Dubai</option>
                  <option>Abu Dhabi</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Guests</label>
                <select
                  value={guests || ''}
                  onChange={(e) => setGuests(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#268700] focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="120">120</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="500">500</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#268700] focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Budget (Per Person)</label>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={10}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full mt-2 accent-[#268700]"
                />
                <p className="text-sm text-gray-600 mt-2 flex items-center gap-1"><img src="/dirham.svg" alt="AED" className="w-3 h-3" />0 – <img src="/dirham.svg" alt="AED" className="w-3 h-3" />{budget}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Menu Type</label>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={menuType.fixed}
                      onChange={(e) =>
                        setMenuType({ ...menuType, fixed: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#268700] cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">Fixed</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={menuType.customizable}
                      onChange={(e) =>
                        setMenuType({ ...menuType, customizable: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#268700] cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">Customizable</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={menuType.liveStations}
                      onChange={(e) =>
                        setMenuType({ ...menuType, liveStations: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#268700] cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">Live Stations</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a Package, Food Item"
                className="flex-1 bg-white border border-gray-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#268700] focus:border-transparent"
              />
              <select className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#268700] focus:border-transparent">
                <option>Recommended</option>
                <option>Rating</option>
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-20">
                <p className="text-gray-500">Loading caterers...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-20">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Caterer Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {caterers.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <p className="text-gray-500">No caterers found matching your filters.</p>
                  </div>
                ) : (
                  caterers.map((c) => {
                    const initials = getInitials(c.name);
                    const rating = c.packages.length > 0 && c.packages[0]?.rating
                      ? typeof c.packages[0].rating === 'number'
                        ? c.packages[0].rating.toFixed(1)
                        : parseFloat(String(c.packages[0].rating)).toFixed(1)
                      : null;

                    return (
                      <Link
                        key={c.id}
                        href={`/caterers/${c.id}`}
                        className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-gray-300 flex flex-col h-full"
                      >
                        {/* Image Section */}
                        <div className="relative h-48 bg-gray-100 overflow-hidden flex-shrink-0">
                          {c.image_url ? (
                            <Image
                              src={c.image_url}
                              alt={c.name}
                              fill
                              className="object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-2xl font-semibold text-gray-600">{initials}</span>
                              </div>
                            </div>
                          )}

                          {/* Rating Badge */}
                          {rating && (
                            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1">
                              <span>⭐</span>
                              <span>{rating}</span>
                            </div>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-[#268700] transition-colors line-clamp-1">
                            {c.name}
                          </h3>

                          {/* Cuisines */}
                          <div className="flex flex-wrap gap-2 mb-4 min-h-[24px]">
                            {c.cuisines.slice(0, 3).map((cu) => (
                              <span
                                key={cu}
                                className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"
                              >
                                {cu}
                              </span>
                            ))}
                            {c.cuisines.length > 3 && (
                              <span className="text-xs font-medium text-gray-500 px-2.5 py-1">
                                +{c.cuisines.length - 3}
                              </span>
                            )}
                          </div>

                          {/* Price and CTA - Pushed to bottom */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Price Range</p>
                              <p className="text-sm font-semibold text-gray-900">{c.priceRange}</p>
                            </div>
                            <div className="text-[#268700] font-medium text-sm group-hover:translate-x-1 transition-transform whitespace-nowrap">
                              View Menu →
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
