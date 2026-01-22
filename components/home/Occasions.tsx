'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api/user.api';
import { occasionNameToSlug, getOccasionContent } from '@/lib/data/occasion-content';

interface Occasion {
  id: string;
  name: string;
  image_url?: string | null;
  description?: string | null;
}

export default function BrowseOccasionsPage() {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchOccasions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userApi.getOccasions();

        if (response.data?.data) {
          setOccasions(response.data.data);
        } else if (response.error) {
          setError(response.error);
        }
      } catch (err: any) {
        console.error('Error fetching occasions:', err);
        setError(err.message || 'Failed to fetch occasions');
      } finally {
        setLoading(false);
      }
    };

    fetchOccasions();
  }, []);

  const handlePrev = () => {
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setIndex((prev) => Math.min(prev + 1, occasions.length - 3));
  };

  const handleOccasionClick = (occasion: Occasion) => {
    // Navigate to occasion landing page
    const slug = occasionNameToSlug(occasion.name);
    router.push(`/occasions/${slug}`);
  };

  if (loading) {
    return (
      <section className="bg-[#FAFAFA] py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-semibold mb-2">
              Browse by Occasions
            </h2>
            <p className="text-gray-500">
              From planning to plating, we make event catering effortless.
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#FAFAFA] py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-semibold mb-2">
              Browse by Occasions
            </h2>
            <p className="text-gray-500">
              From planning to plating, we make event catering effortless.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-center">
            {error}
          </div>
        </div>
      </section>
    );
  }

  if (occasions.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#FAFAFA] py-20 overflow-hidden">
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
            {occasions.map((occasion) => (
              <div
                key={occasion.id}
                className="min-w-[calc(33.333%-1.33rem)]"
              >
                <div
                  onClick={() => handleOccasionClick(occasion)}
                  className="relative w-full h-[260px] bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition"
                >
                  <Image
                    src={getOccasionContent(occasionNameToSlug(occasion.name))?.image || occasion.image_url || '/user/user_occasion1.svg'}
                    alt={occasion.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Fallback to default image if the image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = '/user/user_occasion1.svg';
                    }}
                  />
                </div>
                <p className="mt-4 text-center font-medium text-gray-900">
                  {occasion.name}
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
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
          >
            ‹
          </button>

          <button
            onClick={handleNext}
            disabled={index >= occasions.length - 3}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
