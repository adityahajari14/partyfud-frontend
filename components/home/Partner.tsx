'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function PartnerWithPartyFud() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleJoinClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Always redirect to onboarding
    // If user is not logged in, they'll be prompted to signup/login first
    router.push('/onboarding');
  };

  return (
    <section id="partner" className="relative bg-gradient-to-br from-[#00241b] via-[#002b20] to-[#001a14] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight">
              Partner with PartyFud and Expand
              <br />
              Your Catering Reach
            </h2>

            <p className="mt-6 text-gray-300 max-w-xl leading-relaxed">
              PartyFud is open for all—from café owners and bakers to live-cooking
              chefs and global food brands. Whether you're a small kitchen or a
              multinational company, you can join our platform through a fully
              vetted registration process.
            </p>

            <button
              onClick={handleJoinClick}
              className="inline-block mt-10 bg-[#1f9d55] text-white px-8 py-3 rounded-full font-medium hover:bg-[#17a04b] hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              Join as a Caterer
            </button>
          </div>

          {/* STICKY IMAGE - Bottom Left */}
<div className="absolute bottom-0 right-0 z-20">
  <div className="relative w-[565px] h-[430px] overflow-hidden shadow-2xl">
    <Image
      src="/user/Desktop.svg"
      alt="PartyFud Dashboard Preview"
      fill
      className="object-cover"
      priority
    />
  </div>
</div>


        </div>
      </div>

      {/* Subtle Background Glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-400/10 rounded-full blur-3xl" />
    </section>
  );
}
