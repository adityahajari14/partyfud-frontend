import { OccasionContent } from '@/lib/data/occasion-content';

interface HowToHostProps {
  content: OccasionContent;
}

export default function HowToHost({ content }: HowToHostProps) {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {content.howToTitle}
          </h2>
          <p className="text-gray-600 text-lg">
            {content.howToSubtitle}
          </p>
        </div>

        {/* Tips Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.tips.map((tip) => (
            <div
              key={tip.number}
              className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-[#82C43C] text-5xl font-bold mb-4">
                {tip.number}
              </p>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {tip.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
