// Dubai locations for event venue selection
export const DUBAI_LOCATIONS = [
  'Downtown Dubai',
  'Dubai Marina',
  'Jumeirah',
  'Palm Jumeirah',
  'Business Bay',
  'DIFC',
  'Dubai Mall Area',
  'Burj Al Arab Area',
  'Dubai Festival City',
  'Dubai Sports City',
  'Dubai Media City',
  'Dubai Internet City',
  'Dubai Healthcare City',
  'Dubai World Trade Centre',
  'Dubai Creek',
  'Deira',
  'Bur Dubai',
  'Al Barsha',
  'JBR',
  'Dubai Hills',
  'Arabian Ranches',
  'Emirates Hills',
  'Dubai Silicon Oasis',
] as const;

export type DubaiLocation = (typeof DUBAI_LOCATIONS)[number];

// Price formatting helper
export const formatPrice = (price: number, currency: string = 'AED') => {
  return `${currency} ${price.toLocaleString()}`;
};

// Date formatting helper
export const formatDate = (date: Date | string | null, includeTime: boolean = false) => {
  if (!date) return 'Not specified';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (includeTime) {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Get initials from name
export const getInitials = (name: string): string => {
  const words = name.split(' ').filter(word => word.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Get logo text (first 5 chars)
export const getLogoText = (name: string): string => {
  const words = name.split(' ');
  return words.length > 1
    ? words[0].substring(0, 5).toUpperCase()
    : name.substring(0, 5).toUpperCase();
};

// Get minimum date for event (tomorrow)
export const getMinEventDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};
