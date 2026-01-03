'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { userApi } from '@/lib/api/user.api';

interface CuisineType {
  id: string;
  name: string;
  description?: string | null;
}

// Helper function to get Unsplash image URL based on cuisine name
const getCuisineImage = (cuisineName: string): string => {
  // Map cuisine names to specific Unsplash photo IDs for consistent, high-quality images
  const cuisinePhotoIds: { [key: string]: string } = {
    'Indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop&q=80',
    'Arabic': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop&q=80',
    'Western': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&q=80',
    'Chinese': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80',
    'Italian': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop&q=80',
    'Mediterranean': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop&q=80',
  };
  
  // Try exact match first
  if (cuisinePhotoIds[cuisineName]) {
    return cuisinePhotoIds[cuisineName];
  }
  
  // Try case-insensitive match
  const lowerName = cuisineName.toLowerCase();
  for (const [key, value] of Object.entries(cuisinePhotoIds)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  
  // Fallback: use keyword-based Unsplash search
  const keyword = cuisineName.toLowerCase().replace(/\s+/g, '-') + '-food';
  return `https://images.unsplash.com/featured?${encodeURIComponent(keyword)}&w=800&h=600&fit=crop&q=80`;
};

export default function TopCategoriesPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Initialize with fallback data to ensure something is always visible
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([
    { id: '1', name: 'Indian', description: null },
    { id: '2', name: 'Arabic', description: null },
    { id: '3', name: 'Western', description: null },
    { id: '4', name: 'Chinese', description: null },
    { id: '5', name: 'Italian', description: null },
    { id: '6', name: 'Mediterranean', description: null },
  ]);
  const [loading, setLoading] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const scrollAmount = 320; // Adjust based on card width + gap
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const fetchCuisineTypes = async () => {
      try {
        const response = await userApi.getCuisineTypes();
        console.log('Cuisine Types API Response:', response);
        
        if (response.data) {
          const responseData = response.data as any;
          // Handle different response structures
          let cuisineList: CuisineType[] = [];
          
          if (Array.isArray(responseData)) {
            cuisineList = responseData;
          } else if (responseData.data && Array.isArray(responseData.data)) {
            cuisineList = responseData.data;
          } else if (responseData.success && Array.isArray(responseData.data)) {
            cuisineList = responseData.data;
          }
          
          console.log('Parsed Cuisine Types:', cuisineList);
          
          if (cuisineList.length > 0) {
            setCuisineTypes(cuisineList);
          } else {
            // Fallback if empty
            setCuisineTypes([
              { id: '1', name: 'Indian', description: null },
              { id: '2', name: 'Arabic', description: null },
              { id: '3', name: 'Western', description: null },
              { id: '4', name: 'Chinese', description: null },
              { id: '5', name: 'Italian', description: null },
              { id: '6', name: 'Mediterranean', description: null },
            ]);
          }
        } else {
          // Fallback if no data
          setCuisineTypes([
            { id: '1', name: 'Indian', description: null },
            { id: '2', name: 'Arabic', description: null },
            { id: '3', name: 'Western', description: null },
            { id: '4', name: 'Chinese', description: null },
            { id: '5', name: 'Italian', description: null },
            { id: '6', name: 'Mediterranean', description: null },
          ]);
        }
      } catch (error) {
        console.error('Error fetching cuisine types:', error);
        // Fallback to default categories if API fails
        setCuisineTypes([
          { id: '1', name: 'Indian', description: null },
          { id: '2', name: 'Arabic', description: null },
          { id: '3', name: 'Western', description: null },
          { id: '4', name: 'Chinese', description: null },
          { id: '5', name: 'Italian', description: null },
          { id: '6', name: 'Mediterranean', description: null },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCuisineTypes();
  }, []);

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold mb-2">
            Top Categories
          </h2>
          <p className="text-gray-500">
            Browse dishes by cuisine <span className="bg-blue-100 px-2 py-0.5 rounded">type</span>
          </p>
        </div>

        {/* Cuisine Types Carousel */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700]"></div>
          </div>
        ) : cuisineTypes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No cuisine types available</p>
          </div>
        ) : (
          <div className="relative">
            {/* Scroll Container */}
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-4 no-scrollbar"
            >
              {cuisineTypes.map((cuisine) => (
                <Link
                  key={cuisine.id}
                  href={`/user/menu?cuisine_type_id=${cuisine.id}`}
                  className="relative h-[280px] min-w-[280px] bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block"
                >
                  {/* Image */}
                  <div className="relative w-full h-full bg-gray-200">
                    <Image
                      src={getCuisineImage(cuisine.name)}
                      alt={cuisine.name}
                      fill
                      className="object-cover"
                      sizes="280px"
                      unoptimized
                    />
                  </div>

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />

                  {/* Title */}
                  <span className="absolute bottom-4 left-4 text-white text-lg font-medium z-20">
                    {cuisine.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* Navigation Arrows */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
              >
                ‹
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
