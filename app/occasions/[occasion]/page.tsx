'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getOccasionContent, occasionNameToSlug } from '@/lib/data/occasion-content';
import { userApi } from '@/lib/api/user.api';
import OccasionHero from '@/components/occasions/OccasionHero';
import HowToHost from '@/components/occasions/HowToHost';
import TraditionSection from '@/components/occasions/TraditionSection';
import ModernTakes from '@/components/occasions/ModernTakes';
import TopPackages from '@/components/occasions/TopPackages';

export default function OccasionPage() {
  const params = useParams();
  const router = useRouter();
  const [occasionId, setOccasionId] = useState<string>('');
  const [occasionName, setOccasionName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Get the slug from the URL
  const slug = params.occasion as string;

  useEffect(() => {
    const fetchOccasionData = async () => {
      try {
        setLoading(true);
        // Fetch all occasions to find the matching one
        const response = await userApi.getOccasions();
        
        if (response.data?.data) {
          // Find the occasion that matches the slug
          const occasion = response.data.data.find(
            (occ: any) => occasionNameToSlug(occ.name) === slug
          );

          if (occasion) {
            setOccasionId(occasion.id);
            setOccasionName(occasion.name);
          } else {
            // Redirect to 404 or home if occasion not found
            router.push('/');
          }
        }
      } catch (err) {
        console.error('Error fetching occasion:', err);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchOccasionData();
  }, [slug, router]);

  // Get the occasion content from our data
  const content = getOccasionContent(slug);

  const handleCtaClick = () => {
    if (occasionId) {
      router.push(`/caterers?occasion_id=${encodeURIComponent(occasionId)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#82C43C]"></div>
      </div>
    );
  }

  if (!content) {
    // If we don't have specific content for this occasion, show a generic version
    return (
      <div className="min-h-screen">
        <section className="relative min-h-[500px] flex items-center justify-start bg-gradient-to-r from-black/60 to-black/30">
          <div className="absolute inset-0 bg-gray-800 z-[-1]" />
          <div className="max-w-7xl mx-auto px-6 py-20 text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {occasionName}
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl text-gray-100">
              Discover the perfect catering options for your {occasionName.toLowerCase()} event.
            </p>
            <button
              onClick={handleCtaClick}
              className="bg-[#82C43C] hover:bg-[#6DAF2D] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Find Caterers
            </button>
          </div>
        </section>

        <TopPackages occasionId={occasionId} occasionName={occasionName} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <OccasionHero content={content} onCtaClick={handleCtaClick} />

      {/* How to Host Section */}
      <HowToHost content={content} />

      {/* Tradition Section */}
      <TraditionSection content={content} />

      {/* Modern Takes Section */}
      <ModernTakes content={content} />

      {/* Top Packages Section */}
      <TopPackages occasionId={occasionId} occasionName={occasionName} />
    </div>
  );
}
