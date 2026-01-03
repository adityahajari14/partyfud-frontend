'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { userApi, Package as ApiPackage } from '@/lib/api/user.api';

interface Package {
  id: string;
  title: string;
  caterer: string;
  catererId: string;
  price: number;
  rating?: number;
  image: string;
  badge?: string;
  discount?: string;
}

export default function PopularPackagesPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packageType, setPackageType] = useState<string | null>(null);

  // Read package_type from URL on mount and when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get('package_type');
      setPackageType(typeParam);
    }

    // Listen for URL changes (when PackageTypes component navigates)
    const handleLocationChange = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const typeParam = params.get('package_type');
        setPackageType(typeParam);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    // Also listen for custom events from PackageTypes
    window.addEventListener('packageTypeChanged', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('packageTypeChanged', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filters: any = {
          sort_by: 'rating_desc', // Show popular packages first
        };
        
        if (packageType) {
          filters.package_type = packageType;
        }
        
        const response = await userApi.getAllPackages(filters);
        
        if (response.data?.data) {
          // Map API response to component structure
          const mappedPackages: Package[] = response.data.data
            .slice(0, 8) // Limit to 8 packages for dashboard
            .filter((pkg: ApiPackage) => (pkg as any).caterer?.id) // Only include packages with valid caterer ID
            .map((pkg: ApiPackage) => ({
              id: pkg.id,
              title: pkg.name,
              caterer: (pkg as any).caterer?.name || pkg.package_type?.name || 'Unknown Caterer',
              catererId: (pkg as any).caterer?.id,
              price: pkg.total_price,
              rating: pkg.rating || undefined,
              image: pkg.cover_image_url || '/user/package1.svg',
              badge: (pkg.items?.some((item: any) => item.is_optional) || pkg.category_selections?.length > 0) ? 'Customisable' : undefined,
              discount: undefined, // Can be added if discount logic exists
            }));
          setPackages(mappedPackages);
        } else if (response.error) {
          setError(response.error);
        }
      } catch (err: any) {
        console.error('Error fetching packages:', err);
        setError(err.message || 'Failed to fetch packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [packageType]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const scrollAmount = 360;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-semibold mb-2">
              Popular Packages
            </h2>
            <p className="text-gray-500">
              Browse from the Popular Packages we Have
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
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-semibold mb-2">
              Popular Packages
            </h2>
            <p className="text-gray-500">
              Browse from the Popular Packages we Have
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-center">
            {error}
          </div>
        </div>
      </section>
    );
  }

  if (packages.length === 0) {
    return null;
  }

  // Build URL for "View All Packages" button
  const viewAllUrl = packageType 
    ? `/user/packages?package_type=${encodeURIComponent(packageType)}`
    : '/user/packages';

  return (
    <section className="bg-black/5 py-20">
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
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 no-scrollbar"
          >
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/user/caterers/${pkg.catererId}/${pkg.id}`}
                className="min-w-[300px] bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition block"
              >
                {/* Image */}
                <div className="relative h-[200px] rounded-xl overflow-hidden">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/user/package1.svg';
                    }}
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
                  {pkg.rating && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      ⭐ {pkg.rating}
                    </div>
                  )}
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
                    AED {pkg.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Arrows */}
          {packages.length > 3 && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
              >
                ‹
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
              >
                ›
              </button>
            </div>
          )}

          <Button 
            onClick={() => router.push(viewAllUrl)} 
            className="mt-8 mx-auto block bg-[#268700] text-white px-6 py-3 rounded-md hover:bg-[#1f6b00] transition cursor-pointer"
          >
            View All Packages
          </Button>
        </div>
      </div>
    </section>
  );
}
