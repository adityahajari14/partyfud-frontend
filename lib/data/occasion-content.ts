export interface OccasionTip {
  number: string;
  title: string;
  description: string;
}

export interface OccasionContent {
  slug: string;
  title: string;
  tagline: string;
  heroDescription: string;
  ctaText: string;
  howToTitle: string;
  howToSubtitle: string;
  tips: OccasionTip[];
  traditionTitle: string;
  traditionDescription: string[];
  modernTitle: string;
  modernDescription: string[];
  image: string;
  traditionImage?: string;
  modernImage?: string;
}

export const occasionContentMap: Record<string, OccasionContent> = {
  'afternoon-tea': {
    slug: 'afternoon-tea',
    title: 'Afternoon Tea',
    tagline: 'A TIMELESS TRADITION',
    heroDescription: 'Experience the elegance of British afternoon tea with expert caterers who bring scones, finger sandwiches, and delicate pastries to your event.',
    ctaText: 'Find Tea Caterers',
    howToTitle: 'How to Host the Perfect Afternoon Tea',
    howToSubtitle: 'Essential tips for creating an elegant and memorable tea experience.',
    tips: [
      {
        number: '01',
        title: 'Choose the Right Time',
        description: 'Traditional afternoon tea is served between 2pm and 5pm. This timing allows guests to enjoy a leisurely experience without rushing between meals.',
      },
      {
        number: '02',
        title: 'Plan Your Menu Balance',
        description: 'A classic afternoon tea includes finger sandwiches, scones with clotted cream and jam, and an assortment of pastries. Aim for a mix of savory and sweet.',
      },
      {
        number: '03',
        title: 'Consider Dietary Requirements',
        description: 'Offer gluten-free scones, vegan sandwiches, and sugar-free options. A thoughtful host ensures every guest can enjoy the experience fully.',
      },
      {
        number: '04',
        title: 'Select Your Tea Carefully',
        description: 'Offer at least three tea options: a classic English Breakfast, a fragrant Earl Grey, and a caffeine-free herbal option. Loose leaf teas elevate the experience.',
      },
      {
        number: '05',
        title: 'Set the Scene',
        description: 'Beautiful china, fresh flowers, and elegant table settings transform afternoon tea into a special occasion. Consider a theme that matches your event.',
      },
      {
        number: '06',
        title: 'Timing the Service',
        description: 'Allow 2-3 hours for a full afternoon tea experience. Start with sandwiches, move to scones, and finish with sweets. Replenish tea pots throughout.',
      },
    ],
    traditionTitle: 'The Art of British Afternoon Tea',
    traditionDescription: [
      'Afternoon tea is a cherished British tradition dating back to the 1840s. What began as a simple way to bridge the gap between lunch and dinner has evolved into an elegant social occasion celebrated worldwide.',
      'A proper afternoon tea is served on a three-tiered stand, with savory finger sandwiches on the bottom, warm scones in the middle, and delicate pastries on top. The ritual of pouring tea, spreading clotted cream, and selecting from the array of treats creates a moment of pure indulgence.',
    ],
    modernTitle: 'Modern Takes on a Classic Tradition',
    modernDescription: [
      'While traditional afternoon tea remains beloved, modern interpretations are equally exciting. Think champagne afternoon teas, themed experiences, or fusion menus that blend British classics with international flavors.',
      'From Japanese-inspired matcha treats to Middle Eastern rose-scented pastries, contemporary caterers are reimagining this timeless tradition while honoring its elegant essence.',
    ],
    image: '/occasions/afternoon-tea.png',
    traditionImage: '/occasions/afternoon-tea-tradition.png',
    modernImage: '/occasions/afternoon-tea-modern.png',
  },

  'wedding': {
    slug: 'wedding',
    title: 'Wedding',
    tagline: 'YOUR SPECIAL DAY',
    heroDescription: 'Create unforgettable memories with exquisite catering for your wedding celebration. From intimate ceremonies to grand receptions, we bring your culinary dreams to life.',
    ctaText: 'Find Wedding Caterers',
    howToTitle: 'Planning the Perfect Wedding Reception',
    howToSubtitle: 'Expert guidance for creating a memorable wedding dining experience.',
    tips: [
      {
        number: '01',
        title: 'Set Your Budget Early',
        description: 'Catering typically accounts for 30-50% of your wedding budget. Determine your per-person budget early to guide your menu selections and service style.',
      },
      {
        number: '02',
        title: 'Choose Your Service Style',
        description: 'Decide between plated dinner, buffet, family-style, or food stations. Each creates a different atmosphere and impacts guest experience and timing.',
      },
      {
        number: '03',
        title: 'Schedule Tastings',
        description: 'Always schedule tastings with your top caterer choices. This ensures food quality and allows you to customize menu items to your preferences.',
      },
      {
        number: '04',
        title: 'Plan for Dietary Needs',
        description: 'Collect dietary requirements early and work with your caterer to provide vegetarian, vegan, gluten-free, and allergy-friendly options for all guests.',
      },
      {
        number: '05',
        title: 'Consider the Season',
        description: 'Seasonal menus not only taste better but are often more affordable. Work with your caterer to select ingredients at their peak freshness.',
      },
      {
        number: '06',
        title: 'Timeline Coordination',
        description: 'Coordinate meal service timing with your ceremony, photos, and reception activities. Proper timing ensures hot food arrives hot and guests are comfortable.',
      },
    ],
    traditionTitle: 'The Heart of Wedding Celebrations',
    traditionDescription: [
      'Food has always been central to wedding celebrations across cultures. From ancient Roman feasts to modern multi-course dinners, sharing a meal symbolizes the joining of families and communities.',
      'Today\'s wedding catering blends tradition with personal style. Whether you choose a formal plated dinner, casual buffet, or interactive food stations, the meal creates moments of joy and brings guests together in celebration.',
    ],
    modernTitle: 'Contemporary Wedding Dining Trends',
    modernDescription: [
      'Modern couples are reimagining wedding catering with personalized touches that reflect their story. Food trucks, chef-action stations, late-night snacks, and signature cocktails add unique flair to receptions.',
      'Sustainability is also trending, with couples choosing locally-sourced ingredients, seasonal menus, and eco-friendly service options that celebrate great food while caring for the planet.',
    ],
    image: '/occasions/wedding.png',
    traditionImage: '/occasions/wedding-tradition.png',
    modernImage: '/occasions/wedding-modern.png',
  },

  'corporate-event': {
    slug: 'corporate-event',
    title: 'Corporate Event',
    tagline: 'PROFESSIONAL EXCELLENCE',
    heroDescription: 'Impress clients and energize employees with professional catering services designed for corporate meetings, conferences, and team gatherings.',
    ctaText: 'Find Corporate Caterers',
    howToTitle: 'Hosting Successful Corporate Events',
    howToSubtitle: 'Strategic planning for professional catering that delivers results.',
    tips: [
      {
        number: '01',
        title: 'Know Your Audience',
        description: 'Consider the professional level, cultural backgrounds, and preferences of attendees. Business lunches require different approaches than team celebrations.',
      },
      {
        number: '02',
        title: 'Timing is Critical',
        description: 'Schedule meals around your agenda. Working lunches need quick service, while networking events allow more leisurely dining and conversation.',
      },
      {
        number: '03',
        title: 'Professional Presentation',
        description: 'Presentation matters in corporate settings. Choose caterers who understand professional service standards and can deliver polished, efficient execution.',
      },
      {
        number: '04',
        title: 'Dietary Inclusivity',
        description: 'Provide diverse options accommodating various dietary restrictions. Professional events require vegetarian, vegan, halal, and allergy-friendly choices.',
      },
      {
        number: '05',
        title: 'Consider the Format',
        description: 'Choose between seated meals, buffets, or stations based on your event goals. Networking events benefit from standing reception-style service.',
      },
      {
        number: '06',
        title: 'Plan for Efficiency',
        description: 'Minimize downtime with efficient service. Coordinate breaks, meal times, and refreshments to keep your agenda on track while keeping attendees energized.',
      },
    ],
    traditionTitle: 'The Power of Business Dining',
    traditionDescription: [
      'Corporate events have long recognized that quality catering enhances business outcomes. From building client relationships to boosting employee morale, well-executed meals create positive associations and memorable experiences.',
      'Professional catering demonstrates attention to detail and respect for attendees\' time and comfort. It transforms ordinary meetings into engaging experiences that foster collaboration and strengthen professional connections.',
    ],
    modernTitle: 'Evolving Corporate Catering',
    modernDescription: [
      'Today\'s corporate catering emphasizes wellness, sustainability, and flexibility. Healthy menu options, eco-conscious practices, and customizable formats reflect modern workplace values.',
      'Technology integration, hybrid event capabilities, and creative presentation styles are reshaping corporate dining. Forward-thinking caterers help companies create experiences that inspire, engage, and leave lasting impressions.',
    ],
    image: '/occasions/corporate-event.png',
    traditionImage: '/occasions/corporate-event-tradition.png',
    modernImage: '/occasions/corporate-event-modern.png',
  },

  'birthday-party': {
    slug: 'birthday-party',
    title: 'Birthday Party',
    tagline: 'CELEBRATE IN STYLE',
    heroDescription: 'Make every birthday unforgettable with delicious catering tailored to guests of all ages. From kids\' parties to milestone celebrations, we bring the fun and flavor.',
    ctaText: 'Find Birthday Caterers',
    howToTitle: 'Creating the Ultimate Birthday Celebration',
    howToSubtitle: 'Tips for planning a delicious and memorable birthday party.',
    tips: [
      {
        number: '01',
        title: 'Age-Appropriate Menus',
        description: 'Tailor food choices to your guests. Kids love interactive foods and familiar favorites, while adult parties can feature more sophisticated options.',
      },
      {
        number: '02',
        title: 'Theme Coordination',
        description: 'Align your catering with your party theme. From princess tea parties to sports-themed buffets, coordinated menus enhance the overall experience.',
      },
      {
        number: '03',
        title: 'Interactive Food Stations',
        description: 'Consider DIY food bars like taco stations, sundae bars, or pizza-making activities. Interactive elements create entertainment while satisfying appetites.',
      },
      {
        number: '04',
        title: 'Cake Coordination',
        description: 'Work with your caterer to coordinate cake service timing. Plan for cutting, serving, and ensuring everyone gets their slice at the perfect moment.',
      },
      {
        number: '05',
        title: 'Allergy Awareness',
        description: 'Collect allergy information from parents (for kids\' parties) or guests. Ensure safe, clearly-labeled alternatives for common allergens like nuts and gluten.',
      },
      {
        number: '06',
        title: 'Plan for Leftovers',
        description: 'Order appropriate quantities and arrange for party favor containers. Send guests home with treats as memorable takeaways from the celebration.',
      },
    ],
    traditionTitle: 'The Joy of Birthday Celebrations',
    traditionDescription: [
      'Birthday parties have been bringing people together for generations. From simple cake and ice cream to elaborate themed celebrations, food remains central to marking another year of life and creating joyful memories.',
      'The tradition of birthday cakes with candles dates back centuries, symbolizing the light of life and the warmth of celebration. Today, we honor this tradition while adding creative catering touches that reflect personal style.',
    ],
    modernTitle: 'Creative Birthday Party Trends',
    modernDescription: [
      'Modern birthday parties embrace creativity and personalization. Food trucks, grazing tables, character-themed treats, and Instagram-worthy presentations make celebrations more exciting and shareable.',
      'From milestone birthdays to surprise parties, contemporary catering offers endless possibilities. Dietary-conscious options, interactive experiences, and unique presentations ensure every guest feels celebrated and satisfied.',
    ],
    image: '/occasions/birthday-party.png',
  },

  'graduation': {
    slug: 'graduation',
    title: 'Graduation',
    tagline: 'CELEBRATE ACHIEVEMENT',
    heroDescription: 'Honor academic achievements with catering that brings family and friends together. From intimate gatherings to large celebrations, mark this milestone in style.',
    ctaText: 'Find Graduation Caterers',
    howToTitle: 'Planning a Memorable Graduation Party',
    howToSubtitle: 'Expert tips for celebrating academic success with style.',
    tips: [
      {
        number: '01',
        title: 'Plan for Mixed Ages',
        description: 'Graduation parties often include children, young adults, and older relatives. Offer diverse menu options that appeal to all age groups and preferences.',
      },
      {
        number: '02',
        title: 'Consider Timing',
        description: 'Graduation season is busy for caterers. Book early and consider brunch or afternoon timing to avoid competition with evening ceremonies.',
      },
      {
        number: '03',
        title: 'School Colors Theme',
        description: 'Incorporate school colors into your catering presentation. Color-coordinated foods, beverages, and displays add festive celebration to the achievement.',
      },
      {
        number: '04',
        title: 'Buffet Flexibility',
        description: 'Buffet-style or food stations work well for graduation parties, allowing guests to mingle and serve themselves while celebrating the graduate.',
      },
      {
        number: '05',
        title: 'Photo-Ready Setup',
        description: 'Create attractive food displays that serve as party decor and photo backdrops. Graduation parties generate lots of photos—make your catering Instagram-worthy.',
      },
      {
        number: '06',
        title: 'Weather Backup Plans',
        description: 'Spring and summer graduation parties often feature outdoor elements. Ensure your caterer has weather contingencies for food safety and service.',
      },
    ],
    traditionTitle: 'Honoring Academic Milestones',
    traditionDescription: [
      'Graduation celebrations recognize years of hard work and dedication. Gathering loved ones to share a meal has long been the way we honor achievement and look forward to new beginnings.',
      'From high school to doctoral degrees, graduation parties bring communities together. Food serves as the centerpiece for congratulations, reminiscing, and toasting future success.',
    ],
    modernTitle: 'Contemporary Graduation Celebrations',
    modernDescription: [
      'Modern graduation parties blend tradition with personal style. From casual backyard BBQs to elegant catered dinners, celebrations reflect the graduate\'s personality and future aspirations.',
      'Creative touches like themed dessert bars, signature drinks, and interactive food stations make graduations memorable. Caterers help families celebrate achievement while creating experiences that guests will remember.',
    ],
    image: '/occasions/graduation.png',
  },

  'engagement': {
    slug: 'engagement',
    title: 'Engagement',
    tagline: 'LOVE & COMMITMENT',
    heroDescription: 'Celebrate your engagement with exquisite catering that sets the tone for your journey together. Share joy with loved ones through memorable food and festivities.',
    ctaText: 'Find Engagement Caterers',
    howToTitle: 'Hosting an Unforgettable Engagement Party',
    howToSubtitle: 'Creating the perfect celebration for your special announcement.',
    tips: [
      {
        number: '01',
        title: 'Set the Right Tone',
        description: 'Your engagement party sets expectations for your wedding style. Choose catering that reflects your personality—elegant, casual, or somewhere in between.',
      },
      {
        number: '02',
        title: 'Guest List Considerations',
        description: 'Engagement parties range from intimate to large-scale. Plan your menu and service style based on guest count and the level of formality you desire.',
      },
      {
        number: '03',
        title: 'Signature Drinks',
        description: 'Create a signature cocktail that tells your story. Name it something meaningful and feature it prominently at your celebration.',
      },
      {
        number: '04',
        title: 'Passed Appetizers',
        description: 'Elegant passed hors d\'oeuvres encourage mingling and conversation. They\'re perfect for cocktail-style engagement celebrations where guests circulate.',
      },
      {
        number: '05',
        title: 'Toast Coordination',
        description: 'Plan for toasting moments with champagne or special beverages. Coordinate with your caterer for seamless service during speeches and celebrations.',
      },
      {
        number: '06',
        title: 'Sweet Endings',
        description: 'Feature a beautiful dessert display or engagement cake. Sweet endings create photo opportunities and memorable conclusions to your celebration.',
      },
    ],
    traditionTitle: 'The Romance of Engagement Celebrations',
    traditionDescription: [
      'Engagement parties have long been cherished traditions, bringing families together to celebrate a couple\'s commitment. Sharing food and drink symbolizes the joining of two families and the support surrounding the couple.',
      'From formal dinners to casual gatherings, engagement celebrations create the first chapter of wedding festivities. They offer intimate moments to share joy, introduce families, and begin the journey toward marriage.',
    ],
    modernTitle: 'Modern Engagement Celebrations',
    modernDescription: [
      'Today\'s couples personalize engagement parties to reflect their unique love story. From themed parties to destination celebrations, modern engagements embrace creativity and individual style.',
      'Contemporary catering options range from food trucks to fine dining, tasting menus to themed buffets. Couples choose experiences that feel authentic to them, creating celebrations as unique as their relationships.',
    ],
    image: '/occasions/engagement.png',
  },

  'anniversary': {
    slug: 'anniversary',
    title: 'Anniversary',
    tagline: 'CELEBRATING LOVE',
    heroDescription: 'Mark another year of love and partnership with elegant catering. Whether intimate or grand, celebrate your journey together with food that brings joy.',
    ctaText: 'Find Anniversary Caterers',
    howToTitle: 'Creating a Memorable Anniversary Celebration',
    howToSubtitle: 'Thoughtful planning for honoring years of love and commitment.',
    tips: [
      {
        number: '01',
        title: 'Honor Your History',
        description: 'Incorporate meaningful elements from your wedding or relationship. Recreate your wedding menu, serve your favorite date-night cuisine, or feature meaningful family recipes.',
      },
      {
        number: '02',
        title: 'Milestone Markers',
        description: 'Milestone anniversaries (5, 10, 25, 50 years) call for special recognition. Choose elegant catering that reflects the significance of your years together.',
      },
      {
        number: '03',
        title: 'Intimate or Grand',
        description: 'Decide between intimate dinners for two or larger celebrations with family. Each style offers different catering opportunities—from private chef experiences to full events.',
      },
      {
        number: '04',
        title: 'Romantic Ambiance',
        description: 'Work with caterers who understand romantic presentation. Candlelight, beautiful plating, and thoughtful service create special anniversary moments.',
      },
      {
        number: '05',
        title: 'Wine Pairings',
        description: 'Consider wine or beverage pairings that enhance your menu. Anniversary dinners are perfect opportunities for elevated dining experiences.',
      },
      {
        number: '06',
        title: 'Surprise Elements',
        description: 'Plan surprise touches with your caterer—special toasts, hidden courses, or meaningful presentations that honor your relationship journey.',
      },
    ],
    traditionTitle: 'The Tradition of Anniversary Celebrations',
    traditionDescription: [
      'Anniversary celebrations honor the ongoing commitment and love between partners. From the first year to golden anniversaries, marking these milestones with special meals has been a cherished tradition across cultures.',
      'Food brings comfort, joy, and togetherness—perfect for celebrating years of partnership. Whether recreating wedding memories or creating new traditions, anniversary dining celebrates both past and future.',
    ],
    modernTitle: 'Contemporary Anniversary Experiences',
    modernDescription: [
      'Modern couples celebrate anniversaries in diverse, personal ways. From intimate chef\'s table experiences to vow renewal receptions, contemporary catering offers endless possibilities for meaningful celebrations.',
      'Experiential dining, personalized menus, and thoughtful presentations help couples create new memories while honoring their journey. Each anniversary becomes an opportunity to celebrate love through exceptional food and shared experiences.',
    ],
    image: '/occasions/anniversary.png',
  },

  'arabic-theme-night': {
    slug: 'arabic-theme-night',
    title: 'Arabic Theme Night',
    tagline: 'AUTHENTIC ARABIAN EXPERIENCE',
    heroDescription: 'Immerse yourself in the rich flavors and traditions of Arabian cuisine with authentic buffet experiences featuring mezze, grills, and traditional desserts.',
    ctaText: 'Find Arabic Caterers',
    howToTitle: 'Hosting an Authentic Arabic Night',
    howToSubtitle: 'Creating an immersive Arabian dining experience.',
    tips: [
      {
        number: '01',
        title: 'Traditional Mezze Start',
        description: 'Begin with authentic mezze spreads featuring hummus, baba ganoush, tabbouleh, and fresh pita. These small plates encourage sharing and conversation.',
      },
      {
        number: '02',
        title: 'Live Grilling Stations',
        description: 'Feature live shawarma or mixed grill stations where guests watch skilled chefs prepare kebabs, kofta, and traditional meats with aromatic spices.',
      },
      {
        number: '03',
        title: 'Aromatic Rice Dishes',
        description: 'Include signature dishes like kabsa, mandi, or biryani. These fragrant rice preparations are centerpieces of Arabic feasts and beloved by guests.',
      },
      {
        number: '04',
        title: 'Traditional Seating',
        description: 'Consider traditional floor seating with cushions and low tables for an authentic experience. This creates intimate, cultural ambiance for your event.',
      },
      {
        number: '05',
        title: 'Sweet Endings',
        description: 'Finish with traditional desserts like baklava, kunafa, or date-based sweets. Serve Arabic coffee and tea for an authentic conclusion to the meal.',
      },
      {
        number: '06',
        title: 'Cultural Touches',
        description: 'Enhance the experience with traditional music, decor, and hospitality. Arabic theme nights celebrate culture as much as cuisine.',
      },
    ],
    traditionTitle: 'The Rich Heritage of Arabic Cuisine',
    traditionDescription: [
      'Arabic cuisine reflects centuries of tradition, hospitality, and cultural exchange. From the Levant to the Gulf, Arabian food traditions emphasize generosity, flavor, and bringing people together through shared meals.',
      'Traditional Arabic dining is a communal experience. Large platters encourage sharing, aromatic spices tantalize senses, and the ritual of hospitality makes every guest feel honored and welcome.',
    ],
    modernTitle: 'Contemporary Arabic Dining Experiences',
    modernDescription: [
      'Modern Arabic theme nights blend authentic traditions with contemporary presentation. Interactive stations, fusion elements, and elegant plating bring traditional cuisine to new audiences.',
      'Today\'s caterers honor Arabic culinary heritage while adapting to diverse dietary needs and preferences. From traditional buffets to modern interpretations, Arabic theme nights offer unforgettable cultural dining experiences.',
    ],
    image: '/occasions/arabic-theme-night.png',
  },

  'traditional-afternoon-tea': {
    slug: 'traditional-afternoon-tea',
    title: 'Traditional Afternoon Tea',
    tagline: 'TIMELESS ELEGANCE',
    heroDescription: 'Experience the quintessential British afternoon tea tradition with elegant service, fine teas, finger sandwiches, scones, and delicate pastries.',
    ctaText: 'Find Tea Service Caterers',
    howToTitle: 'The Perfect Traditional Afternoon Tea',
    howToSubtitle: 'Mastering the art of classic British tea service.',
    tips: [
      {
        number: '01',
        title: 'The Three-Tier Stand',
        description: 'Proper service uses three tiers: finger sandwiches on bottom, scones with cream and jam in middle, pastries and sweets on top. This traditional presentation is iconic.',
      },
      {
        number: '02',
        title: 'Quality Tea Selection',
        description: 'Offer premium loose-leaf teas including English Breakfast, Earl Grey, Darjeeling, and herbal options. Tea quality defines authentic afternoon tea experiences.',
      },
      {
        number: '03',
        title: 'Scone Perfection',
        description: 'Serve warm scones with clotted cream and preserves. The cream-or-jam-first debate aside, quality scones are essential to traditional afternoon tea.',
      },
      {
        number: '04',
        title: 'Finger Sandwiches',
        description: 'Classic varieties include cucumber, smoked salmon, egg mayonnaise, and ham. Remove crusts and cut into elegant triangles or rectangles.',
      },
      {
        number: '05',
        title: 'Proper Timing',
        description: 'Traditional afternoon tea occurs between 3pm and 5pm. This timing honors the original purpose of bridging lunch and dinner.',
      },
      {
        number: '06',
        title: 'Elegant Presentation',
        description: 'Fine china, silver service, fresh flowers, and proper table linens create the refined atmosphere essential to traditional afternoon tea.',
      },
    ],
    traditionTitle: 'The British Afternoon Tea Tradition',
    traditionDescription: [
      'Afternoon tea became a British institution in the 1840s when Anna, Duchess of Bedford, began taking tea and light refreshments to tide her over between lunch and dinner. This simple practice evolved into an elegant social occasion.',
      'Traditional afternoon tea represents British culture at its finest. The ritual of brewing tea, the precise arrangement of foods, and the leisurely pace create moments of refinement and social connection that transcend time.',
    ],
    modernTitle: 'Afternoon Tea Today',
    modernDescription: [
      'While maintaining classical traditions, modern afternoon tea embraces creative variations. Champagne teas, themed experiences, and contemporary flavors attract new generations to this elegant tradition.',
      'Today\'s caterers respect traditional formats while accommodating dietary requirements and adding innovative touches. From hotel tea rooms to private events, afternoon tea remains a beloved celebration of elegance and flavor.',
    ],
    image: '/occasions/traditional-afternoon-tea.png',
  },

  'indian-buffet': {
    slug: 'indian-buffet',
    title: 'Indian Buffet',
    tagline: 'FLAVORS OF INDIA',
    heroDescription: 'Explore the vibrant, aromatic world of Indian cuisine with authentic buffet experiences featuring regional specialties, tandoor grills, and traditional curries.',
    ctaText: 'Find Indian Caterers',
    howToTitle: 'Creating an Authentic Indian Buffet Experience',
    howToSubtitle: 'Celebrating the diversity and richness of Indian cuisine.',
    tips: [
      {
        number: '01',
        title: 'Regional Variety',
        description: 'Include dishes from different regions—North Indian curries, South Indian dosas, Bengali sweets, and Goan seafood. Diversity showcases India\'s culinary richness.',
      },
      {
        number: '02',
        title: 'Vegetarian Focus',
        description: 'Offer substantial vegetarian options including paneer dishes, dal varieties, and vegetable curries. Indian cuisine excels at vegetarian preparations.',
      },
      {
        number: '03',
        title: 'Tandoor Specialties',
        description: 'Feature tandoor-cooked items like naan, tandoori chicken, and kebabs. The smoky, charred flavors from clay oven cooking are distinctive and beloved.',
      },
      {
        number: '04',
        title: 'Rice and Breads',
        description: 'Provide both basmati rice and various breads (naan, roti, paratha). These staples are essential for soaking up flavorful curries and sauces.',
      },
      {
        number: '05',
        title: 'Spice Level Options',
        description: 'Clearly mark spice levels and offer mild to spicy options. Include cooling accompaniments like raita, yogurt, and lassi to balance heat.',
      },
      {
        number: '06',
        title: 'Sweet Conclusion',
        description: 'End with traditional Indian desserts like gulab jamun, kheer, or jalebi. These sweet treats provide perfect endings to flavorful meals.',
      },
    ],
    traditionTitle: 'The Heritage of Indian Cuisine',
    traditionDescription: [
      'Indian cuisine reflects thousands of years of history, regional diversity, and cultural influences. From Mughal-era biryanis to ancient Ayurvedic principles, Indian food traditions celebrate flavor, spice, and communal dining.',
      'Traditional Indian buffets, inspired by the concept of thali (platter) service, offer abundant variety. The practice of serving multiple dishes simultaneously allows diners to experience the full spectrum of Indian flavors.',
    ],
    modernTitle: 'Contemporary Indian Dining',
    modernDescription: [
      'Modern Indian catering blends traditional recipes with contemporary presentation and global influences. Fusion dishes, modern plating, and creative interpretations bring Indian cuisine to new audiences.',
      'Today\'s Indian buffets accommodate diverse dietary needs while maintaining authentic flavors. From street food-inspired stations to elegant fine dining presentations, Indian catering offers experiences for every occasion.',
    ],
    image: '/occasions/indian-buffet.png',
  },
};

// Helper function to get occasion content by slug
export function getOccasionContent(slug: string): OccasionContent | undefined {
  return occasionContentMap[slug];
}

// Helper function to convert occasion name to slug
export function occasionNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}
