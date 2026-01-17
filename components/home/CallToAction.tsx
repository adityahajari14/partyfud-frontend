'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function CallToAction() {
  const router = useRouter();

  const handleStartPlanning = () => {
    router.push('/caterers');
  };

  const handleJoinPartner = () => {
    router.push('/onboarding');
  };

  return (
    <section className="relative bg-gradient-to-br from-[#00241b] via-[#003d2a] to-[#00241b] py-24 overflow-hidden">
      {/* Background Glow Effects   */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#268700]/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#1f9d55]/20 rounded-full blur-3xl opacity-50" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Card - Planning an Event */}
          <div className="group relative bg-white/95 backdrop-blur-md rounded-2xl p-10 border border-white/20 shadow-2xl hover:shadow-[0_20px_60px_rgba(38,135,0,0.15)] transition-all duration-500 hover:-translate-y-1">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 leading-tight">
                Planning an Event?
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Find the perfect caterer for your occasion. Browse menus, compare prices, and book with confidence.
              </p>
              <button
                onClick={handleStartPlanning}
                className="bg-gray-900 hover:bg-[#268700] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 group/btn shadow-lg hover:shadow-xl hover:shadow-[#268700]/20 hover:scale-105"
              >
                Start Planning
                <ArrowRight 
                  size={20} 
                  className="group-hover/btn:translate-x-1 transition-transform duration-300"
                />
              </button>
            </div>
          </div>

          {/* Right Card - A Caterer or Chef */}
          <div className="group relative bg-white/95 backdrop-blur-md rounded-2xl p-10 border border-white/20 shadow-2xl hover:shadow-[0_20px_60px_rgba(38,135,0,0.15)] transition-all duration-500 hover:-translate-y-1">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 leading-tight">
                A Caterer or Chef?
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Grow your business with more event orders. Join our network of trusted catering partners.
              </p>
              <button
                onClick={handleJoinPartner}
                className="bg-gray-900 hover:bg-[#268700] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 group/btn shadow-lg hover:shadow-xl hover:shadow-[#268700]/20 hover:scale-105"
              >
                Join as a Partner
                <ArrowRight 
                  size={20} 
                  className="group-hover/btn:translate-x-1 transition-transform duration-300"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

