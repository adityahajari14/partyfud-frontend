import Image from 'next/image';
import { OccasionContent } from '@/lib/data/occasion-content';

interface TraditionSectionProps {
  content: OccasionContent;
}

export default function TraditionSection({ content }: TraditionSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {content.traditionTitle}
            </h2>
            {content.traditionDescription.map((paragraph, index) => (
              <p key={index} className="text-gray-600 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Image */}
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src={content.image}
              alt={content.traditionTitle}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
