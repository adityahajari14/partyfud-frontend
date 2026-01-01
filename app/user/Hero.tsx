'use client'
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {

return(
<section className="relative bg-white overflow-hidden">
            <div className="max-w-8xl mx-auto px-18 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* LEFT CONTENT */}
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight text-black">
                            Plan Any Event.
                            <br />
                            Order Any Food.
                        </h1>

                        <p className="mt-6 text-gray-600 max-w-xl text-lg leading-relaxed">
                            UAE&apos;s first dedicated catering marketplace. From canapés to
                            private chefs discover trusted caterers across Dubai, Abu Dhabi
                            & beyond.
                        </p>

                        <Link
                            href="/user/menu"
                            className="inline-block mt-8 bg-[#268700] text-white px-8 py-3 rounded-full text-sm font-medium hover:opacity-90 transition"
                        >
                            Order Now
                        </Link>
                    </div>

                    {/* RIGHT IMAGES */}
                    <div className="relative flex justify-center lg:justify-end">

                        {/* Main Big Image */}
                        <div className="relative w-180 h-120 rounded-2xl overflow-hidden shadow-xl">
                            <Image
                                src="/user/user_dashboard_img1.svg"
                                alt="Catering food spread"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Floating Card – Top Right */}
                        <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg w-64 overflow-hidden">
                            <div className="relative h-32">
                                <Image
                                    src="/user/user_dashboard_img2.svg"
                                    alt="Veg New Year Brunch"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                                        Customisable
                                    </span>
                                    <span className="flex items-center gap-1 text-gray-600">
                                        ⭐ 4.5
                                    </span>
                                </div>
                                <p className="text-sm font-medium">Veg New Year Brunch</p>
                                <p className="text-xs text-gray-500">Al Sharib Caterers</p>
                            </div>
                        </div>

                        {/* Floating Card – Bottom */}
                        <div className="absolute -bottom-8 -left-10 bg-white rounded-xl shadow-lg flex items-center gap-4 p-2 w-84">
                            <div className="w-22 h-14 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
                                AZIZ
                            </div>
                            <div>
                                <p className="font-medium text-sm">Aziz Caterers</p>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        Italian
                                    </span>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        Indian
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                    ⭐ 4.5
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
);
}