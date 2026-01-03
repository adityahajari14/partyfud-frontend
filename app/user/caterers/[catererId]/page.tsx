'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { userApi, type Caterer, type Package } from '@/lib/api/user.api';

export default function CatererMenuPage() {
  const { catererId } = useParams<{ catererId: string }>();
  const [caterer, setCaterer] = useState<Caterer | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!catererId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch caterer and packages in parallel
        const [catererResponse, packagesResponse] = await Promise.all([
          userApi.getCatererById(catererId),
          userApi.getPackagesByCatererId(catererId),
        ]);

        if (catererResponse.error) {
          setError(catererResponse.error);
        } else if (catererResponse.data?.data) {
          setCaterer(catererResponse.data.data);
        }

        if (packagesResponse.error) {
          console.error('Error fetching packages:', packagesResponse.error);
        } else if (packagesResponse.data?.data) {
          setPackages(packagesResponse.data.data);
        }
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [catererId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !caterer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{error || 'Caterer not found.'}</p>
      </div>
    );
  }

  return (
    <section className="bg-[#FAFAFA] min-h-screen px-6 py-10">
      <label className='text-sm ml-24 underline cursor-pointer'>Menu</label><label className='text-sm cursor-pointer'> / Package Details</label>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">

        {/* LEFT CATERER INFO */}
        <aside className="bg-white border border-gray-200 rounded-xl p-4 h-fit">
          <div className="bg-green-700 text-white text-center py-6 rounded-lg font-semibold text-lg">
            {caterer.name.split(' ')[0]}
          </div>

          <h3 className="mt-4 font-semibold">{caterer.name}</h3>

          <div className="flex gap-2 mt-2 flex-wrap">
            {caterer.cuisines.map((c) => (
              <span
                key={c}
                className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
              >
                {c}
              </span>
            ))}
          </div>

          <div className="text-sm text-gray-600 mt-2">
            ⭐ {packages.length > 0 && packages[0]?.rating ? packages[0].rating : 'N/A'}
          </div>

          <p className="text-sm text-gray-600 mt-4">
            {caterer.description}
          </p>

          <p className="font-semibold mt-4">{caterer.priceRange}</p>
        </aside>

        {/* RIGHT PACKAGES */}
        <div>
          {packages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No packages available for this caterer.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/user/caterers/${catererId}/${pkg.id}`}>
                  <div className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition cursor-pointer">
                    <div className="relative h-[180px] rounded-lg overflow-hidden">
                      <Image
                        src={pkg.cover_image_url || '/default_dish.jpg'}
                        alt={pkg.name}
                        fill
                        className="object-cover"
                      />

                      <div className="absolute top-2 left-2 flex gap-2">
                        {pkg.category_selections && pkg.category_selections.length > 0 && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            Customisable
                          </span>
                        )}
                      </div>

                      {pkg.rating && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          ⭐ {pkg.rating}
                        </div>
                      )}
                    </div>

                    <h4 className="mt-3 font-medium">{pkg.name}</h4>
                    <p className="text-sm text-gray-500">{caterer.name}</p>
                    <p className="mt-2 font-semibold">
                      AED {pkg.price_per_person.toLocaleString()}/person
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      For {pkg.people_count} people
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
