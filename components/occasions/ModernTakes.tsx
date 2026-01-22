import Image from 'next/image';
import { OccasionContent } from '@/lib/data/occasion-content';

interface ModernTakesProps {
  content: OccasionContent;
}

export default function ModernTakes({ content }: ModernTakesProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src={content.modernImage || content.image}
              alt={content.modernTitle}
              fill
              className="object-cover"
            />
          </div>

          {/* Text Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {content.modernTitle}
            </h2>
            {content.modernDescription.map((paragraph, index) => (
              <p key={index} className="text-gray-600 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
