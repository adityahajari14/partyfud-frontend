import React from "react";
import {
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import Image from "next/image";

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-linear-to-b from-[#0b0a2a] to-[#09081f] text-white">
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <div className="relative w-90 h-60">
          {/* Top blob */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-30 rounded-full bg-[#2f3b2b] opacity-30" />

          {/* Bottom blob */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-60 h-30 rounded-full bg-[#2f3b2b] opacity-30" />
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
          <div>
            <h2 className="text-3xl font-semibold mb-3">
              Join PartyFud for Business?
            </h2>
            <p className="text-gray-400 max-w-xl">
              Take your catering business to the next level—get discovered,
              get booked, and watch your customer base grow.
            </p>
          </div>

          <button className="bg-[#1ee87a] text-black font-medium px-6 py-3 rounded-full hover:opacity-90 transition">
            Book Demo
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Image src="/logo_partyfud_light.svg" alt="PartyFud Logo" width={100} height={100} />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Partyfud.com <br />
            A platform part of D2 Digital LLC
          </p>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li>Home</li>
            <li>About us</li>
            <li>Services</li>
            <li>Why choose us</li>
            <li>Careers</li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li>Terms of Use</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h4 className="font-semibold mb-4">Contacts</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={16} />
              555-123-4567
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} />
              217 Blake Ave, Austin
            </li>
          </ul>

          {/* Social Icons */}
          <div className="flex gap-4 mt-6">
            <a className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
              <Facebook size={18} />
            </a>
            <a className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
              <Instagram size={18} />
            </a>
            <a className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
              <Youtube size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="h-px bg-white/10" />
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm gap-3">
        <span>© 2025 Company. All rights reserved</span>
        <div className="flex gap-6">
          <span className="hover:text-white cursor-pointer">Terms of Use</span>
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
};

// export default Footer;