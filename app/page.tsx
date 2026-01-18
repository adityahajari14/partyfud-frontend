'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Occasions from '@/components/home/Occasions';
import EventTypes from '@/components/home/EventTypes';
import WhyChoose from '@/components/home/WhyChoose';
import Caterers from '@/components/home/Caterers';
import Categories from '@/components/home/Categories';
import Partner from '@/components/home/Partner';
import Testimonials from '@/components/home/Testimonials';
import HowItWorks from '@/components/home/HowItWorks';

export default function Home() {

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <EventTypes />
        <Occasions />
        <WhyChoose />
        {/* <Caterers />
        <Categories /> */}
        <Partner />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
