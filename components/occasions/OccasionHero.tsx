import { OccasionContent } from '@/lib/data/occasion-content';

interface OccasionHeroProps {
  content: OccasionContent;
  onCtaClick: () => void;
}

export default function OccasionHero({ content, onCtaClick }: OccasionHeroProps) {
  return (
    <section className="relative min-h-[500px] flex items-center justify-start bg-gradient-to-r from-black/60 to-black/30">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-[-1]"
        style={{
          backgroundImage: `url(${content.image})`,
        }}
      />
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-white">
        <p className="text-[#82C43C] font-semibold tracking-wider mb-4 uppercase">
          {content.tagline}
        </p>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-2xl">
          {content.title}
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl text-gray-100">
          {content.heroDescription}
        </p>
        <button
          onClick={onCtaClick}
          className="bg-[#82C43C] hover:bg-[#6DAF2D] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          {content.ctaText}
        </button>
      </div>
    </section>
  );
}
