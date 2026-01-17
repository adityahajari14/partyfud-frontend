'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api/user.api';
import { 
  Cake, 
  FileText, 
  Heart, 
  Ship, 
  UtensilsCrossed, 
  Home, 
  ChefHat,
  type LucideIcon
} from 'lucide-react';

interface PackageType {
  id: string;
  name: string;
  image_url?: string | null;
  description?: string | null;
}

interface EventTypeConfig {
  name: string;
  icon: LucideIcon;
  description: string;
  matchKeywords: string[];
}

// Map of event types with their icons and descriptions
const eventTypeConfigs: EventTypeConfig[] = [
  {
    name: 'Birthday Parties',
    icon: Cake,
    description: "From kids' parties to milestone celebrations",
    matchKeywords: ['birthday', 'birthday party', 'birthday parties']
  },
  {
    name: 'Corporate Events',
    icon: FileText,
    description: 'Office lunches, conferences & team gatherings',
    matchKeywords: ['corporate', 'corporate event', 'corporate events', 'business', 'office']
  },
  {
    name: 'Weddings',
    icon: Heart,
    description: 'Make your special day unforgettable',
    matchKeywords: ['wedding', 'weddings', 'marriage', 'bridal']
  },
  {
    name: 'Yacht & Luxury',
    icon: Ship,
    description: 'Premium catering for exclusive events',
    matchKeywords: ['yacht', 'luxury', 'premium', 'exclusive', 'vip']
  },
  {
    name: 'Private Dining',
    icon: UtensilsCrossed,
    description: 'Intimate dinners with personal chefs',
    matchKeywords: ['private', 'private dining', 'dining', 'intimate', 'personal']
  },
  {
    name: 'Family Gatherings',
    icon: Home,
    description: 'Traditional gatherings & family celebrations',
    matchKeywords: ['family', 'family gathering', 'family gatherings', 'traditional', 'gathering']
  }
];

export default function EventTypes() {
  const router = useRouter();
  const [occasions, setOccasions] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    const fetchOccasions = async () => {
      try {
        setLoading(true);
        const response = await userApi.getOccasions();
        
        if (response.data?.data) {
          setOccasions(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching occasions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOccasions();
  }, []);

  // Match event types to occasions from API
  const getOccasionForEventType = (eventTypeName: string): PackageType | null => {
    const lowerEventName = eventTypeName.toLowerCase();
    
    // Try to find matching occasion by name or keywords
    for (const occasion of occasions) {
      const lowerOccasionName = occasion.name.toLowerCase();
      
      // Check if event type keywords match occasion name
      const eventConfig = eventTypeConfigs.find(etc => etc.name === eventTypeName);
      if (eventConfig) {
        const hasMatchingKeyword = eventConfig.matchKeywords.some(keyword => 
          lowerOccasionName.includes(keyword.toLowerCase())
        );
        
        if (hasMatchingKeyword || lowerOccasionName === lowerEventName) {
          return occasion;
        }
      }
    }
    
    // Fallback: try exact name match
    const exactMatch = occasions.find(
      occ => occ.name.toLowerCase() === lowerEventName
    );
    
    return exactMatch || null;
  };

  const handleEventTypeClick = (eventTypeName: string) => {
    // Find matching occasion from API
    const matchingOccasion = getOccasionForEventType(eventTypeName);

    if (matchingOccasion) {
      // Navigate with occasion_name parameter
      router.push(`/caterers?occasion_name=${encodeURIComponent(matchingOccasion.name)}`);
    } else {
      // Fallback: navigate with the event type name as occasion_name
      router.push(`/caterers?occasion_name=${encodeURIComponent(eventTypeName)}`);
    }
  };

  if (loading) {
    return (
      <section className="bg-[#FAFAFA] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-semibold mb-2">
              Browse by Event Type
            </h2>
            <p className="text-gray-500">
              Find the perfect catering for your occasion
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#268700]"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#FAFAFA] py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-2 text-gray-900">
            Browse by Event Type
          </h2>
          <p className="text-gray-600 text-lg">
            Find the perfect catering for your occasion
          </p>
        </div>

        {/* Event Type Cards */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-5">
          {eventTypeConfigs.map((eventType, index) => {
            const Icon = eventType.icon;
            const isHighlighted = eventType.name === 'Yacht & Luxury';
            const isSelected = selectedType === eventType.name;
            
            return (
              <div
                key={eventType.name}
                onClick={() => {
                  setSelectedType(eventType.name);
                  handleEventTypeClick(eventType.name);
                }}
                className={`
                  relative bg-gray-900 rounded-xl p-5 md:p-6 w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)] 
                  md:w-[calc(25%-1rem)] lg:w-[calc(14.28%-1rem)] min-w-[160px] max-w-[200px]
                  cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl
                  ${isHighlighted || isSelected ? 'ring-2 ring-[#268700]' : 'ring-0'}
                `}
                onMouseEnter={() => setSelectedType(eventType.name)}
                onMouseLeave={() => setSelectedType(null)}
              >
                {/* Icon */}
                <div className="flex justify-center mb-3 md:mb-4">
                  <Icon 
                    size={32} 
                    className="text-white md:w-9 md:h-9" 
                    strokeWidth={1.5}
                  />
                </div>

                {/* Title */}
                <h3 className="text-white font-semibold text-center mb-2 text-xs md:text-sm">
                  {eventType.name}
                </h3>

                {/* Description */}
                <p className="text-gray-300 text-[10px] md:text-xs text-center leading-relaxed min-h-[36px] md:min-h-[40px]">
                  {eventType.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

