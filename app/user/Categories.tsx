'use client';

import Image from 'next/image';

interface Category {
  title: string;
  image: string;
}

const categories: Category[] = [
  {
    title: 'Cakes',
    image: '/user/cake.svg',
  },
  {
    title: 'Desserts',
    image: '/user/cake.svg',
  },
  {
    title: 'Indian',
    image: '/user/cake.svg',
  },
  {
    title: 'Italian',
    image: '/user/cake.svg',
  },
];

export default function TopCategoriesPage() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold mb-2">
            Top Categories
          </h2>
          <p className="text-gray-500">
            Browse from the Popular Packages we Have
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.title + category.image}
              className="relative h-[280px] rounded-2xl overflow-hidden"
            >
              {/* Image */}
              <Image
                src={category.image}
                alt={category.title}
                fill
                className="object-cover"
                priority
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Title */}
              <span className="absolute bottom-4 left-4 text-white text-lg font-medium">
                {category.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
