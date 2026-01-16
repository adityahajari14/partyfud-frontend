'use client';

import { 
  CheckCircle2, 
  Sliders, 
  DollarSign, 
  ShieldCheck, 
  Headphones,
  type LucideIcon
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: CheckCircle2,
    title: 'Verified Caterers & Chefs',
    description: 'Every partner is vetted for quality, hygiene, and reliability.'
  },
  {
    icon: Sliders,
    title: 'Flexible Menu Options',
    description: 'Set menus, build-your-own, or fully customized — your choice.'
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    description: 'No hidden fees. See exactly what you pay for upfront.'
  },
  {
    icon: ShieldCheck,
    title: 'One Invoice for Everything',
    description: 'Simplified billing for all your catering needs.'
  },
  {
    icon: Headphones,
    title: 'Dedicated Event Support',
    description: 'Our team is here to help from booking to cleanup.'
  }
];

export default function WhyChoose() {
  return (
    <section className="bg-[#FAFAFA] py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-3 text-gray-900">
            Why Choose PartyFud
          </h2>
          <p className="text-gray-600 text-lg">
            We're not just a marketplace — we're your catering partner.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                {/* Icon with light green background */}
                <div className="mb-4">
                  <div className="w-14 h-14 bg-green-50 rounded-lg flex items-center justify-center">
                    <Icon 
                      size={28} 
                      className="text-[#268700]" 
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

