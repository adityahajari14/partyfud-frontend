'use client';

import Image from 'next/image';

interface Testimonial {
  name: string;
  handle: string;
  avatar: string;
  content: string;
  highlight?: boolean;
}

const testimonials: Testimonial[] = [
  {
    name: 'Chen Family',
    handle: '@chenfamilyevents',
    avatar: '/user/package1.svg',
    content:
      "PartyFud is helping us find the perfect caterer for our next big event. The platform is easy to use and the caterers are all highly rated. We can't wait!",
  },
  {
    name: 'Samir Patel',
    handle: '@samirpatel',
    avatar: '/user/package1.svg',
    content:
      "PartyFud is a lifesaver for busy professionals like me. It's so easy to find and book catering for my meetings and events. I highly recommend it! PartyFud is the best catering platform I've ever used.",
  },
  {
    name: 'Elias',
    handle: '@elias_baker',
    avatar: '/user/package1.svg',
    content:
      "Thanks to PartyFud, planning my wedding catering was stress-free. The platform made it easy to find the perfect menu and vendors. I highly recommend it!",
  },
  {
    name: 'Aisha Khan',
    handle: '@aishakhan',
    avatar: '/user/package1.svg',
    content:
      "PartyFud has made planning my family gatherings a breeze. The platform is user-friendly and the caterers are always on time and professional. Thank you, PartyFud!",
  },
  {
    name: 'Leah Petrova',
    handle: '@leahpetrova',
    avatar: '/user/package1.svg',
    content:
      "PartyFud has revolutionized the way I plan corporate events. The platform is user-friendly and the caterers are top-notch. I'm so glad I found it!",
  },
  {
    name: 'Avery',
    handle: '@avery_jacks',
    avatar: '/user/package1.svg',
    content:
      'I love that PartyFud is helping me find local caterers for my events. It’s a lifesaver!',
    highlight: true,
  },
];

export default function TestimonialsPage() {
  return (
    <section className="bg-[#FAFAFA] py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center max-w-7xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
            We’ve got lots of friends, and we’re always looking for more
          </h2>
          <p className="mt-4 text-gray-600">
            PartyFud is open for all—from café owners and bakers to live-cooking
            chefs and global food brands. Whether you're a small kitchen or a
            multinational company, you can join our platform through a fully
            vetted registration process.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm"
            >
              {/* User */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.handle}</p>
                </div>
              </div>

              {/* Content */}
              <p
                className="text-sm leading-relaxed text-gray-600"
              >
                {t.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
