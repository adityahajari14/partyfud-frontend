'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Occasion {
  title: string;
  image: string;
}

const occasions: Occasion[] = [
  { title: 'Afternoon Tea Party', image: '/user/user_occasion1.svg' },
  { title: 'Corporate Events', image: '/user/user_occasion2.svg' },
  { title: 'Engagement Party', image: '/user/user_occasion3.svg' },
  { title: 'Birthday Party', image: '/user/user_occasion4.svg' },
  { title: 'Wedding Reception', image: '/user/user_occasion5.svg' },
];

export default function BrowseOccasionsPage() {
  const [index, setIndex] = useState(0);

  const handlePrev = () => {
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setIndex((prev) => Math.min(prev + 1, occasions.length - 3));
  };

  return (
    <section className="bg-white py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold mb-2">
            Browse by Occasions
          </h2>
          <p className="text-gray-500">
            From planning to plating, we make event catering effortless.
          </p>
        </div>

        {/* Slider */}
        <div className="relative overflow-hidden">
          <div
            className="flex gap-8 transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${index * (100 / 3)}%)`,
            }}
          >
            {occasions.map((item) => (
              <div
                key={item.title}
                className="min-w-[calc(33.333%-1.33rem)]"
              >
                <div className="relative w-full h-[260px] rounded-2xl overflow-hidden shadow-sm">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="mt-4 text-center font-medium text-gray-900">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mt-10">
          <button
            onClick={handlePrev}
            disabled={index === 0}
            className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
          >
            ‹
          </button>

          <button
            onClick={handleNext}
            disabled={index >= occasions.length - 3}
            className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
