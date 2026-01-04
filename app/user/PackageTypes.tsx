'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { userApi } from '@/lib/api/user.api';
import { useRouter } from 'next/navigation';

interface PackageType {
  id: string;
  name: string;
  image_url?: string | null;
  description?: string | null;
}

export default function PackageTypesPage() {
  const [packageTypes, setPackageTypes] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchPackageTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userApi.getPackageTypes();
        
        if (response.data?.data) {
          setPackageTypes(response.data.data);
        } else if (response.error) {
          setError(response.error);
        }
      } catch (err: any) {
        console.error('Error fetching package types:', err);
        setError(err.message || 'Failed to fetch package types');
      } finally {
        setLoading(false);
      }
    };

    fetchPackageTypes();
  }, []);

  const handlePrev = () => {
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setIndex((prev) => Math.min(prev + 1, packageTypes.length - 3));
  };

  const handlePackageTypeClick = (packageTypeName: string) => {
    router.push(`/user/packages?package_type=${encodeURIComponent(packageTypeName)}`);
  };

  if (loading) {
    return (
      <section className="bg-[#FAFAFA] py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-semibold mb-2">
              Browser Occasions
            </h2>
            <p className="text-gray-500">
              Browse occasions by type
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
              Browser Occasions
            </h2>
            <p className="text-gray-500">
              Browse occasions by type
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-center">
            {error}
          </div>
        </div>
      </section>
    );
  }

  if (packageTypes.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#FAFAFA] py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold mb-2">
            Browser Occasions
          </h2>
          <p className="text-gray-500">
            Browse occasions by type
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
            {packageTypes.map((packageType) => (
              <div
                key={packageType.id}
                className="min-w-[calc(33.333%-1.33rem)]"
              >
                <div 
                  onClick={() => handlePackageTypeClick(packageType.name)}
                  className="relative w-full h-[260px] bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition"
                >
                  <Image
                    src={packageType.image_url || '/user/package1.svg'}
                    alt={packageType.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Fallback to default image if the image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = '/user/package1.svg';
                    }}
                  />
                </div>
                <p className="mt-4 text-center font-medium text-gray-900">
                  {packageType.name}
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
            disabled={index >= packageTypes.length - 3}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

