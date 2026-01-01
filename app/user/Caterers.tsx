'use client';

import { useRef } from 'react';

interface Caterer {
  name: string;
  logoText: string;
  logoBg: string;
  cuisines: string[];
  rating: number;
}

const caterers: Caterer[] = [
  {
    name: 'Aziz Caterers',
    logoText: 'AZIZ',
    logoBg: 'bg-orange-500',
    cuisines: ['Italian', 'Indian'],
    rating: 4.5,
  },
  {
    name: 'Shariah Caterers',
    logoText: 'Shariah',
    logoBg: 'bg-green-700',
    cuisines: ['Italian', 'Middle Eastern'],
    rating: 4.5,
  },
  {
    name: 'Diamond Caterers',
    logoText: 'DC',
    logoBg: 'bg-black',
    cuisines: ['Italian', 'Indian'],
    rating: 4.5,
  },
  {
    name: 'Royal Feast',
    logoText: 'RF',
    logoBg: 'bg-purple-700',
    cuisines: ['Continental'],
    rating: 4.6,
  },
];

export default function TopCaterers() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: dir === 'left' ? -320 : 320,
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold mb-2">
            Top Caterers
          </h2>
          <p className="text-gray-500">
            Browse from the Popular Packages we Have
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar"
          >
            {caterers.map((caterer, i) => (
              <div
                key={i}
                className="min-w-[320px] bg-white border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition"
              >
                {/* Logo */}
                <div
                  className={`w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-lg ${caterer.logoBg}`}
                >
                  {caterer.logoText}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {caterer.name}
                  </h3>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {caterer.cuisines.map((cuisine) => (
                      <span
                        key={cuisine}
                        className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                    ⭐ {caterer.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <div className="flex justify-center gap-4 mt-10">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100"
            >
              ‹
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
