'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function WhatsAppButton() {
    // TODO: Update with the actual WhatsApp number
    const phoneNumber = '971501234567';
    const message = 'Hello! I would like to know more about PartyFud catering services.';

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <Link
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 hover:scale-110 transition-transform duration-300 group"
            aria-label="Contact us on WhatsApp"
        >
            <div className="relative w-14 h-14 md:w-16 md:h-16 drop-shadow-xl rounded-full p-0.5">
                {/* Green ping animation effect */}
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-20 animate-ping"></span>

                <Image
                    src="/WhatsApp.svg"
                    alt="WhatsApp"
                    fill
                    className="object-contain"
                />
            </div>
        </Link>
    );
}
