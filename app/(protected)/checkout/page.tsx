'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api/user.api';
import { 
  Calendar, 
  MapPin, 
  Users, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  Building,
  FileText,
  Minus,
  Plus
} from 'lucide-react';
import { Toast, useToast } from '@/components/ui/Toast';
import { DUBAI_LOCATIONS, getMinEventDate } from '@/lib/constants';

interface CartItem {
  id: string;
  package: {
    id: string;
    name: string;
    people_count: number;
    total_price: number;
    price_per_person: number;
    currency: string;
    cover_image_url?: string | null;
    caterer: {
      id: string;
      business_name: string | null;
      name?: string;
    };
  };
  guests: number | null;
  price_at_time: number | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface Occasion {
  id: string;
  name: string;
}

type CheckoutStep = 'event-details' | 'review' | 'payment';

// Time slots for event
const TIME_SLOTS = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 PM', '9:00 PM',
];

// UAE Cities
const UAE_CITIES = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  
  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // Checkout step
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('event-details');
  
  // Occasions
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  
  // Event details form
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventType, setEventType] = useState('');
  const [guestCount, setGuestCount] = useState(50);
  
  // Delivery address form
  const [venueName, setVenueName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Dubai');
  const [area, setArea] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Payment form
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const minDate = getMinEventDate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cartRes, occasionsRes] = await Promise.all([
        userApi.getCartItems(),
        userApi.getOccasions(),
      ]);
      
      if (cartRes.data?.data) {
        setCartItems(cartRes.data.data);
        // Set initial guest count from first cart item
        if (cartRes.data.data.length > 0 && cartRes.data.data[0].guests) {
          setGuestCount(cartRes.data.data[0].guests);
        }
      } else if (cartRes.error) {
        showToast('error', cartRes.error || 'Failed to load cart');
        if (cartRes.status === 401) {
          router.push('/login?redirect=/checkout');
        }
      }
      
      if (occasionsRes.data?.data) {
        setOccasions(occasionsRes.data.data);
      }
    } catch (err) {
      showToast('error', 'Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate prices based on guest count
  const calculateItemPrice = (item: CartItem) => {
    const pricePerPerson = item.package.price_per_person || 
      (item.package.total_price / (item.package.people_count || 1));
    return Math.round(pricePerPerson * guestCount);
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + calculateItemPrice(item), 0);
  }, [cartItems, guestCount]);

  const deliveryFee = 150; // Fixed delivery fee
  const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
  const total = subtotal + deliveryFee + serviceFee;

  // Validation
  const isEventDetailsValid = eventDate && eventTime && eventType && guestCount > 0 && streetAddress && city;
  const isPaymentValid = cardNumber.length >= 16 && cardExpiry.length >= 5 && cardCvc.length >= 3 && cardName.length > 0;

  const handleContinueToReview = () => {
    if (!isEventDetailsValid) {
      showToast('error', 'Please fill in all required fields');
      return;
    }
    setCurrentStep('review');
  };

  const handleContinueToPayment = () => {
    setCurrentStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      showToast('error', 'Your cart is empty');
      return;
    }

    if (!isPaymentValid) {
      showToast('error', 'Please fill in all payment details');
      return;
    }

    setPlacingOrder(true);
    try {
      // Update cart items with new guest count before placing order
      for (const item of cartItems) {
        await userApi.updateCartItem(item.id, {
          guests: guestCount,
          price_at_time: calculateItemPrice(item),
        });
      }

      const res = await userApi.createOrder({
        cart_item_ids: cartItems.map((item) => item.id),
        items: [],
      });

      if (res.error) {
        showToast('error', res.error);
        return;
      }

      if (res.data?.success) {
        setOrderPlaced(true);
        showToast('success', 'Order placed successfully!');
        setTimeout(() => {
          router.push('/orders');
        }, 2000);
      }
    } catch (err) {
      showToast('error', 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-500 mb-6">
            Your order has been confirmed. Redirecting to orders page...
          </p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Add items to your cart before checkout
          </p>
          <button
            onClick={() => router.push('/cart')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'event-details' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-600 text-white'
              }`}>
                1
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === 'event-details' ? 'text-green-600' : 'text-gray-900'
              }`}>
                Event Details
              </span>
            </div>
            
            <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
            
            {/* Step 2 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'review' 
                  ? 'bg-green-600 text-white' 
                  : currentStep === 'payment'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === 'review' ? 'text-green-600' : 'text-gray-500'
              }`}>
                Review Order
              </span>
            </div>
            
            <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
            
            {/* Step 3 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'payment' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === 'payment' ? 'text-green-600' : 'text-gray-500'
              }`}>
                Payment
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Event Details */}
            {currentStep === 'event-details' && (
              <>
                {/* Event Details Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <h2 className="font-semibold text-lg text-gray-900">Event Details</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {/* Event Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          min={minDate}
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Select date"
                        />
                      </div>
                    </div>

                    {/* Event Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Time <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={eventTime}
                          onChange={(e) => setEventTime(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                        >
                          <option value="">Select time</option>
                          {TIME_SLOTS.map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Event Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select event type</option>
                      {occasions.map((occasion) => (
                        <option key={occasion.id} value={occasion.id}>{occasion.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Number of Guests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Number of Guests <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border border-gray-200 rounded-lg w-fit">
                      <button
                        onClick={() => setGuestCount(Math.max(1, guestCount - 10))}
                        className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={guestCount}
                        onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value)))}
                        className="w-24 text-center py-2.5 text-sm focus:outline-none"
                        min={1}
                      />
                      <button
                        onClick={() => setGuestCount(guestCount + 10)}
                        className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delivery Address Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <h2 className="font-semibold text-lg text-gray-900">Delivery Address</h2>
                  </div>

                  {/* Venue Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="Venue Name"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Street Address */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="Street Address *"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* City and Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {UAE_CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area
                      </label>
                      <select
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Area</option>
                        {DUBAI_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions
                    </label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Special Instructions..."
                      rows={3}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleContinueToReview}
                  disabled={!isEventDetailsValid}
                  className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    isEventDetailsValid
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continue to Review
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Step 2: Review Order */}
            {currentStep === 'review' && (
              <>
                {/* Order Items */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-5 h-5 text-green-600" />
                    <h2 className="font-semibold text-lg text-gray-900">Order Items</h2>
                  </div>

                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div className="relative w-20 h-20 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                          <Image
                            src={item.package.cover_image_url || '/logo2.svg'}
                            alt={item.package.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {item.package.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.package.caterer?.business_name || item.package.caterer?.name || 'Caterer'}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                            <Users className="w-3 h-3" />
                            <span>{guestCount} guests</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-green-600">
                            AED {calculateItemPrice(item).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Summary */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <h2 className="font-semibold text-lg text-gray-900">Event Summary</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">{eventDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Time</p>
                      <p className="font-medium text-gray-900">{eventTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Event Type</p>
                      <p className="font-medium text-gray-900">
                        {occasions.find(o => o.id === eventType)?.name || eventType}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Guests</p>
                      <p className="font-medium text-gray-900">{guestCount}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 mt-4 pt-4">
                    <p className="text-gray-500 text-sm mb-1">Delivery Address</p>
                    <p className="font-medium text-gray-900">
                      {venueName && `${venueName}, `}
                      {streetAddress}, {area && `${area}, `}{city}
                    </p>
                    {specialInstructions && (
                      <p className="text-sm text-gray-500 mt-2">
                        <span className="font-medium">Note:</span> {specialInstructions}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setCurrentStep('event-details')}
                    className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Edit Details
                  </button>
                </div>

                {/* Continue to Payment */}
                <button
                  onClick={handleContinueToPayment}
                  className="w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700"
                >
                  Continue to Payment
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Step 3: Payment */}
            {currentStep === 'payment' && (
              <>
                {/* Payment Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <h2 className="font-semibold text-lg text-gray-900">Payment Details</h2>
                  </div>

                  {/* Card Number */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Expiry and CVC */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        maxLength={4}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </div>

                {/* Back and Place Order Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep('review')}
                    className="flex-1 py-3 rounded-lg font-medium transition border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder || !isPaymentValid}
                    className={`flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                      placingOrder || !isPaymentValid
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {placingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay AED {total.toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              <h2 className="font-semibold text-lg text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Cart Items Summary */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate pr-2">{item.package.name}</span>
                    <span className="font-medium shrink-0">AED {calculateItemPrice(item).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">AED {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium">AED {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee (5%)</span>
                  <span className="font-medium">AED {serviceFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-green-600">
                    AED {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Guest count info */}
              <p className="text-xs text-gray-500 mt-3 text-center">
                For {guestCount} guests
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={hideToast} />
      )}
    </div>
  );
}
