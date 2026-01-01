'use client';

import { useRef } from 'react';
import Image from 'next/image';

interface Package {
  title: string;
  caterer: string;
  price: string;
  rating: number;
  image: string;
  badge?: string;
  discount?: string;
}

const packages: Package[] = [
  {
    title: 'Veg New Year Brunch',
    caterer: 'Al Sharbh Caterers',
    price: 'AED 2,355',
    rating: 4.5,
    image: '/user/package1.svg',
    badge: 'Customiseable',
  },
  {
    title: 'Gourmet Italian Feast',
    caterer: 'Cibo e Vino Catering',
    price: 'AED 2,355',
    rating: 4.5,
    image: '/user/package2.svg',
    badge: 'Customiseable',
    discount: '20% Off',
  },
  {
    title: 'Mediterranean Summer Soiree',
    caterer: 'Sunset Catering Co.',
    price: 'AED 2,355',
    rating: 4.5,
    image: '/user/package3.svg',
    badge: 'Customiseable',
  },
  {
    title: 'Elegant Asian Spread',
    caterer: 'Lotus Blossom',
    price: 'AED 2,355',
    rating: 4.5,
    image: '/user/package4.svg',
    badge: 'Customiseable',
  },
];

export default function PopularPackagesPage() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const scrollAmount = 360;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold mb-2">
            Popular Packages
          </h2>
          <p className="text-gray-500">
            Browse from the Popular Packages we Have
          </p>
        </div>

        {/* Scroll Container */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4"
          >
            {packages.map((pkg, index) => (
              <div
                key={index}
                className="min-w-[300px] bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition"
              >
                {/* Image */}
                <div className="relative h-[200px] rounded-xl overflow-hidden">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    className="object-cover"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {pkg.discount && (
                      <span className="bg-white text-xs px-2 py-1 rounded-full shadow">
                        {pkg.discount}
                      </span>
                    )}
                    {pkg.badge && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        {pkg.badge}
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    ⭐ {pkg.rating}
                  </div>
                </div>

                {/* Content */}
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900">
                    {pkg.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {pkg.caterer}
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {pkg.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <div className="flex justify-center gap-4 mt-8">
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
