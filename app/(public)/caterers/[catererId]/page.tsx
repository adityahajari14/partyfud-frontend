'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { userApi, type Caterer, type Package } from '@/lib/api/user.api';
import { Star, MapPin, Users, ChefHat, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EventDetailsForm } from '@/components/user/EventDetailsForm';
import { PackageCard } from '@/components/user/PackageCard';
import { Toast, useToast } from '@/components/ui/Toast';
import { getLogoText } from '@/lib/constants';

type TabType = 'packages' | 'buildOwn' | 'requestQuote';

interface Occasion {
  id: string;
  name: string;
}

export default function CatererDetailPage() {
  const { catererId } = useParams<{ catererId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  // Data states
  const [caterer, setCaterer] = useState<Caterer | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI states
  const [activeTab, setActiveTab] = useState<TabType>('packages');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedCustomizablePackage, setSelectedCustomizablePackage] = useState<Package | null>(null);
  const [loadingOccasions, setLoadingOccasions] = useState(false);

  // Form states
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState(50);
  const [eventDate, setEventDate] = useState('');

  // Quote request states
  const [quoteVision, setQuoteVision] = useState('');
  const [quoteBudget, setQuoteBudget] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<Set<string>>(new Set());
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Fetch initial data
  useEffect(() => {
    if (!catererId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [catererRes, packagesRes, occasionsRes] = await Promise.all([
          userApi.getCatererById(catererId),
          userApi.getPackagesByCatererId(catererId),
          userApi.getOccasions(),
        ]);

        if (catererRes.error) {
          setError(catererRes.error);
          return;
        }

        if (catererRes.data?.data) {
          setCaterer(catererRes.data.data);
        }

        if (packagesRes.data?.data) {
          setPackages(packagesRes.data.data);
          // Set initial selected package (prefer fixed, then customizable)
          const fixedPackages = packagesRes.data.data.filter(
            (pkg: Package) => pkg.customisation_type === 'FIXED'
          );
          const customizablePackages = packagesRes.data.data.filter(
            (pkg: Package) => pkg.customisation_type === 'CUSTOMISABLE' || pkg.customisation_type === 'CUSTOMIZABLE'
          );
          
          if (fixedPackages.length > 0) {
            setSelectedPackage(fixedPackages[0]);
            setGuestCount(fixedPackages[0].people_count || fixedPackages[0].minimum_people || 50);
          }
          if (customizablePackages.length > 0) {
            setSelectedCustomizablePackage(customizablePackages[0]);
          }
        }

        if (occasionsRes.data?.data) {
          setOccasions(occasionsRes.data.data);
        }
      } catch (err) {
        setError('Failed to load caterer details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [catererId]);

  // Filter packages by type
  const fixedPackages = useMemo(() => {
    return packages.filter((pkg) => pkg.customisation_type === 'FIXED');
  }, [packages]);

  const customizablePackages = useMemo(() => {
    return packages.filter(
      (pkg) => pkg.customisation_type === 'CUSTOMISABLE' || pkg.customisation_type === 'CUSTOMIZABLE'
    );
  }, [packages]);

  // Calculate totals
  const packageTotal = useMemo(() => {
    if (!selectedPackage) return 0;
    const peopleCount = selectedPackage.people_count || selectedPackage.minimum_people || 1;
    const pricePerPerson = selectedPackage.price_per_person ?? (selectedPackage.total_price / peopleCount);
    return pricePerPerson * guestCount;
  }, [selectedPackage, guestCount]);

  const customizablePackageTotal = useMemo(() => {
    if (!selectedCustomizablePackage) return 0;
    const peopleCount = selectedCustomizablePackage.people_count || selectedCustomizablePackage.minimum_people || 1;
    const pricePerPerson = selectedCustomizablePackage.price_per_person ?? (selectedCustomizablePackage.total_price / peopleCount);
    return pricePerPerson * guestCount;
  }, [selectedCustomizablePackage, guestCount]);

  // Validate form for packages
  const isFormValid = eventType && location && guestCount > 0 && eventDate;

  // Handle continue to package details (for fixed packages)
  const handleContinueToPackage = () => {
    if (!selectedPackage || !isFormValid) {
      showToast('error', 'Please fill in all event details');
      return;
    }

    const params = new URLSearchParams({
      guests: guestCount.toString(),
      eventType,
      location,
      date: eventDate,
    });

    router.push(`/caterers/${catererId}/${selectedPackage.id}?${params.toString()}`);
  };

  // Handle continue to customizable package details
  const handleContinueToCustomizablePackage = () => {
    if (!selectedCustomizablePackage || !isFormValid) {
      showToast('error', 'Please fill in all event details');
      return;
    }

    const params = new URLSearchParams({
      guests: guestCount.toString(),
      eventType,
      location,
      date: eventDate,
    });

    router.push(`/caterers/${catererId}/${selectedCustomizablePackage.id}?${params.toString()}`);
  };

  // Handle quote request
  const handleRequestQuote = async () => {
    if (!catererId) return;

    if (!user) {
      showToast('error', 'Please log in to request a quote');
      router.push('/login');
      return;
    }

    setSubmittingQuote(true);
    try {
      const res = await userApi.createProposal({
        caterer_id: catererId,
        event_type: eventType || undefined,
        location: location || undefined,
        dietary_preferences: Array.from(dietaryPreferences),
        budget_per_person: quoteBudget || undefined,
        event_date: eventDate || undefined,
        vision: quoteVision || undefined,
        guest_count: guestCount,
      });

      if (res.error) {
        showToast('error', res.error);
        return;
      }

      showToast('success', 'Quote request submitted successfully!');
      // Reset form
      setQuoteVision('');
      setQuoteBudget('');
      setDietaryPreferences(new Set());
    } catch (err) {
      showToast('error', 'Failed to submit quote request');
    } finally {
      setSubmittingQuote(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading caterer...</p>
        </div>
      </div>
    );
  }

  if (error || !caterer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || 'Caterer not found'}</p>
          <Link
            href="/caterers"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Caterers
          </Link>
        </div>
      </div>
    );
  }

  const logoText = getLogoText(caterer.name);

  return (
    <section className="bg-gray-50 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/caterers" className="hover:text-green-600 transition">
            Caterers
          </Link>
          <span>/</span>
          <span className="text-gray-900">{caterer.name}</span>
        </nav>

        {/* Caterer Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Logo/Image */}
            <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              {caterer.image_url ? (
                <Image
                  src={caterer.image_url}
                  alt={caterer.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                  {logoText}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {caterer.name}
              </h1>

              {/* Cuisines */}
              <div className="flex flex-wrap gap-2 mb-3">
                {caterer.cuisines.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {packages[0]?.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-gray-900">
                      {Number(packages[0].rating).toFixed(1)}
                    </span>
                  </div>
                )}
                {caterer.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{caterer.location}</span>
                  </div>
                )}
                {(caterer.minimum_guests || caterer.maximum_guests) && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>
                      {caterer.minimum_guests && `${caterer.minimum_guests}`}
                      {caterer.minimum_guests && caterer.maximum_guests && ' - '}
                      {caterer.maximum_guests && `${caterer.maximum_guests}`} guests
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {caterer.description && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                  {caterer.description}
                </p>
              )}

              {/* Price Range */}
              <p className="font-semibold text-gray-900 mt-3">
                {caterer.priceRange}
              </p>

              {/* Service Types */}
              <div className="flex flex-wrap gap-2 mt-3">
                {caterer.delivery_only && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <ChefHat className="w-3 h-3" /> Delivery
                  </span>
                )}
                {caterer.delivery_plus_setup && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <ChefHat className="w-3 h-3" /> Setup
                  </span>
                )}
                {caterer.full_service && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <ChefHat className="w-3 h-3" /> Full Service
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Images */}
        {caterer.gallery_images && caterer.gallery_images.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {caterer.gallery_images.map((imageUrl, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
                  <Image
                    src={imageUrl}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-1 mb-6">
          <div className="flex gap-1">
            {[ 
              { id: 'packages', label: 'Set Menu' },
              { id: 'buildOwn', label: 'Build Your Own' },
              { id: 'requestQuote', label: 'Request Quote' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition ${activeTab === tab.id
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'packages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Packages List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Fixed Menu Packages
                </h2>

                {fixedPackages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No fixed menu packages available from this caterer.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fixedPackages.map((pkg) => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        isSelected={selectedPackage?.id === pkg.id}
                        onSelect={() => {
                          setSelectedPackage(pkg);
                          setGuestCount(pkg.people_count || pkg.minimum_people || guestCount);
                        }}
                        guestCount={guestCount}
                        catererId={catererId}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Event Details Sidebar */}
            <div className="lg:col-span-1">
              <EventDetailsForm
                eventType={eventType}
                setEventType={setEventType}
                location={location}
                setLocation={setLocation}
                guestCount={guestCount}
                setGuestCount={setGuestCount}
                eventDate={eventDate}
                setEventDate={setEventDate}
                occasions={occasions}
                loadingOccasions={loadingOccasions}
                minGuests={caterer.minimum_guests}
                maxGuests={caterer.maximum_guests}
                estimatedTotal={packageTotal}
                className="sticky top-4"
              />
            </div>
          </div>
        )}

        {activeTab === 'buildOwn' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customizable Packages List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Customizable Menu Packages
                </h2>

                {customizablePackages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No customizable menu packages available from this caterer.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customizablePackages.map((pkg) => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        isSelected={selectedCustomizablePackage?.id === pkg.id}
                        onSelect={() => {
                          setSelectedCustomizablePackage(pkg);
                          setGuestCount(pkg.people_count || pkg.minimum_people || guestCount);
                        }}
                        guestCount={guestCount}
                        catererId={catererId}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Event Details Sidebar */}
            <div className="lg:col-span-1">
              <EventDetailsForm
                eventType={eventType}
                setEventType={setEventType}
                location={location}
                setLocation={setLocation}
                guestCount={guestCount}
                setGuestCount={setGuestCount}
                eventDate={eventDate}
                setEventDate={setEventDate}
                occasions={occasions}
                loadingOccasions={loadingOccasions}
                minGuests={caterer.minimum_guests}
                maxGuests={caterer.maximum_guests}
                estimatedTotal={customizablePackageTotal}
                className="sticky top-4"
              />
            </div>
          </div>
        )}

        {activeTab === 'requestQuote' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Request a Custom Quote
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Tell us about your event and we'll create a personalized proposal for you.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Event Type</option>
                    {occasions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Guest Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Event Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget per Person (AED)
                  </label>
                  <input
                    type="text"
                    value={quoteBudget}
                    onChange={(e) => setQuoteBudget(e.target.value)}
                    placeholder="e.g., 150"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your event location"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Dietary Preferences */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Vegetarian', 'Vegan', 'Halal', 'Gluten Free', 'Sugar Free', 'Kosher'].map(
                    (pref) => {
                      const isSelected = dietaryPreferences.has(pref);
                      return (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => {
                            const newPrefs = new Set(dietaryPreferences);
                            if (isSelected) {
                              newPrefs.delete(pref);
                            } else {
                              newPrefs.add(pref);
                            }
                            setDietaryPreferences(newPrefs);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${isSelected
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                            }`}
                        >
                          {pref}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Vision */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about your vision
                </label>
                <textarea
                  value={quoteVision}
                  onChange={(e) => setQuoteVision(e.target.value)}
                  placeholder="Describe your event, theme, special requirements..."
                  rows={4}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <button
                onClick={handleRequestQuote}
                disabled={submittingQuote}
                className={`w-full py-3 rounded-lg font-medium transition ${submittingQuote
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                {submittingQuote ? 'Submitting...' : 'Submit Quote Request'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar for Set Menu */}
      {activeTab === 'packages' && selectedPackage && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total for {guestCount} guests</p>
                <p className="text-2xl font-bold text-gray-900">
                  AED {packageTotal.toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleContinueToPackage}
                disabled={!isFormValid}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${isFormValid
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar for Build Your Own */}
      {activeTab === 'buildOwn' && selectedCustomizablePackage && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total for {guestCount} guests</p>
                <p className="text-2xl font-bold text-gray-900">
                  AED {customizablePackageTotal.toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleContinueToCustomizablePackage}
                disabled={!isFormValid}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${isFormValid
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={hideToast} />
      )}
    </section>
  );
}
