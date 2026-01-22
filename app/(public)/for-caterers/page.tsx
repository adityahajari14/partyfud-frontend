import React from 'react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import {
    ChefHat,
    Store,
    UtensilsCrossed,
    Building2,
    Truck,
    Users,
    Wallet,
    MousePointerClick,
    ListChecks,
    ArrowRight,
    ClipboardCheck,
    UserCircle,
    Upload,
    BellRing,
    CreditCard
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'For Caterers | PartyFud',
    description: 'Grow your catering business with PartyFud. Join our network of trusted catering partners and get discovered by customers planning events.',
};

export default function ForCaterersPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white text-neutral-900 font-sans">

            {/* Hero Section */}
            <section className="relative h-[600px] flex items-center overflow-hidden bg-black">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop"
                        alt="Elegant catering spread"
                        fill
                        priority
                        className="object-cover opacity-50"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 via-black/40 via-black/20 to-transparent" />
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="max-w-3xl space-y-6">
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                            Grow Your Catering Business with <span className="text-[#64C042]">More Event Orders</span>
                        </h1>

                        <p className="text-lg text-gray-200 leading-relaxed">
                            Get discovered by customers planning birthdays, corporate events, and luxury experiences. Join our network of trusted catering partners.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href="/onboarding">
                                <button className="bg-[#64C042] text-white px-8 py-3 rounded-md text-sm font-bold hover:bg-[#53a635] transition-colors shadow-sm flex items-center gap-2">
                                    Join as a Caterer
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </Link>
                            <Link href="#how-it-works">
                                <button className="px-8 py-3 border border-gray-200 rounded-md text-sm font-bold text-white hover:bg-white/10 transition-colors">
                                    How it Works
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who Can Join Section */}
            <section className="bg-[#FAFAFA] py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-semibold mb-3 text-gray-900">Who Can Join?</h2>
                        <p className="text-lg text-gray-600">
                            Whether you're a solo chef or a large catering company, there's a place for you.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <PartnerTypeCard icon={ChefHat} title="Private Chefs" />
                        <PartnerTypeCard icon={UtensilsCrossed} title="Bakeries" />
                        <PartnerTypeCard icon={Truck} title="Catering Co." />
                        <PartnerTypeCard icon={Building2} title="Cloud Kitchens" />
                        <PartnerTypeCard icon={Store} title="Restaurants" />
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-semibold mb-3 text-gray-900">Why Partner With PartyFud?</h2>
                        <p className="text-lg text-gray-600">We handle the marketing and booking technology so you can focus on the food.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <BenefitCard
                            icon={Users}
                            title="Access High-Intent Customers"
                            description="Connect with customers actively planning events — no more chasing leads."
                        />
                        <BenefitCard
                            icon={ListChecks}
                            title="Flexible Menu Formats"
                            description="Offer set menus, build-your-own options, or fully custom catering."
                        />
                        <BenefitCard
                            icon={MousePointerClick}
                            title="Centralized Orders"
                            description="Manage all bookings in one place with secure, timely payments."
                        />
                        <BenefitCard
                            icon={Building2}
                            title="Business & Corporate Clients"
                            description="Get access to high-value corporate accounts and repeat business."
                        />
                        <BenefitCard
                            icon={Wallet}
                            title="Transparent Commission"
                            description="Know exactly what you earn. No hidden fees, no surprises."
                        />
                        <BenefitCard
                            icon={Truck}
                            title="Streamlined Logistics"
                            description="Coordinate delivery details and requirements seamlessly through our platform."
                        />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="bg-[#FAFAFA] py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-lg text-gray-600">
                            From planning to plating, we make event catering effortless.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gray-200 -z-0"></div>

                        {/* Steps Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
                            <StepCard number={1} icon={ClipboardCheck} title="Sign Up & Verify" description="Create your account and verify your business credentials." />
                            <StepCard number={2} icon={UserCircle} title="Create Profile" description="Showcase your cuisine, specialties, and service area." />
                            <StepCard number={3} icon={Upload} title="Upload Menus" description="Add your set menus, à la carte items, or custom offerings." />
                            <StepCard number={4} icon={BellRing} title="Receive Orders" description="Get notified of new bookings and manage them easily." />
                            <StepCard number={5} icon={CreditCard} title="Get Paid" description="Receive payments directly to your account after each event." />
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="relative bg-gradient-to-br from-[#00241b] via-[#002b20] to-[#001a14] overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 py-24">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight mb-6">
                            Ready to Grow Your Business?
                        </h2>
                        <p className="text-lg text-gray-300 leading-relaxed mb-10">
                            Join hundreds of caterers and chefs already using PartyFud to reach new customers and manage their bookings.
                        </p>
                        <Link href="/onboarding">
                            <button className="bg-[#1f9d55] text-white px-8 py-3 rounded-full font-medium hover:bg-[#17a04b] hover:shadow-lg transition-all duration-200">
                                Start Your Application
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Subtle Background Glow */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-400/10 rounded-full blur-3xl" />
            </section>

        </div>
    );
}

// Subcomponents

function PartnerTypeCard({ icon: Icon, title }: { icon: any, title: string }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="mb-4">
                <div className="w-14 h-14 bg-green-50 rounded-lg flex items-center justify-center">
                    <Icon className="h-7 w-7 text-[#268700]" strokeWidth={1.5} />
                </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
    );
}

function BenefitCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="mb-4">
                <div className="w-14 h-14 bg-green-50 rounded-lg flex items-center justify-center">
                    <Icon className="h-7 w-7 text-[#268700]" strokeWidth={1.5} />
                </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
}

function StepCard({ number, icon: Icon, title, description }: { number: number, icon: any, title: string, description: string }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
            {/* Step Number Badge */}
            <div className="absolute -top-4 left-6">
                <div className="w-8 h-8 bg-[#268700] rounded flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                        {number}
                    </span>
                </div>
            </div>

            {/* Icon */}
            <div className="mt-4 mb-4">
                <Icon className="w-8 h-8 text-[#268700]" strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
}
