'use client';

import { Calendar, ChefHat, Settings, PartyPopper } from 'lucide-react';

export default function HowItWorks() {
    const steps = [
        {
            number: 1,
            icon: Calendar,
            title: 'Choose Your Event',
            description: 'Tell us about your occasion, date, and guest count to get personalized recommendations.',
        },
        {
            number: 2,
            icon: ChefHat,
            title: 'Browse Menus & Chefs',
            description: 'Explore verified caterers, compare menus, and read reviews from real customers.',
        },
        {
            number: 3,
            icon: Settings,
            title: 'Customize Your Order',
            description: 'Personalize your menu, add extras like staff or drinks, and confirm your booking.',
        },
        {
            number: 4,
            icon: PartyPopper,
            title: 'Enjoy Stress-Free Catering',
            description: 'Sit back and let your caterer handle everything. Your event, perfectly catered.',
        },
    ];

    return (
        <section className="bg-[#FAFAFA] py-16">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6">
                {/* Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
                        How It Works
                    </h2>
                    <p className="text-lg text-gray-600">
                        From planning to plating, we make event catering effortless.
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="relative">
                    {/* Connecting Line */}
                    <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gray-200 -z-0"></div>

                    {/* Steps Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                        {steps.map((step, index) => {
                            const IconComponent = step.icon;
                            return (
                                <div
                                    key={step.number}
                                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative"
                                >
                                    {/* Step Number Badge */}
                                    <div className="absolute -top-4 left-6">
                                        <div className="w-8 h-8 bg-[#268700] rounded flex items-center justify-center">
                                            <span className="text-white font-semibold text-sm">
                                                {step.number}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Icon */}
                                    <div className="mt-4 mb-4">
                                        <IconComponent
                                            className="w-8 h-8 text-[#268700]"
                                            strokeWidth={1.5}
                                        />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {step.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

