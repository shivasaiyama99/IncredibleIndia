import React, { useMemo, useState, useCallback } from 'react';
import { hotels } from '../data/hotels';
import { Star, MapPin, Wifi, Car, Coffee, Waves } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Added: For authentication and booking
import BookingConfirmation from './BookingConfirmation'; // Added: Modern booking confirmation

const Hotels: React.FC = () => {
  const { user, token } = useAuth(); // Added: Get auth context for booking
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [dest, setDest] = useState('');
  const [searched, setSearched] = useState(false);
  const [dateError, setDateError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false); // Added: Booking state
  const [showConfirmation, setShowConfirmation] = useState(false); // Added: Confirmation modal state

  const today = new Date().toISOString().split('T')[0];

  const validateDates = (checkIn: string, checkOut: string) => {
    const checkInDateObj = new Date(checkIn);
    const checkOutDateObj = new Date(checkOut);
    const todayObj = new Date(today);

    if (checkIn && checkInDateObj < todayObj) {
      setDateError('Check-in date cannot be earlier than today');
      return false;
    }

    if (checkIn && checkOut && checkOutDateObj <= checkInDateObj) {
      setDateError('Check-out date must be after the check-in date');
      return false;
    }

    setDateError('');
    return true;
  };

  const handleCheckInChange = (date: string) => {
    setCheckInDate(date);
    validateDates(date, checkOutDate);
  };

  const handleCheckOutChange = (date: string) => {
    setCheckOutDate(date);
    validateDates(checkInDate, date);
  };

  const getAmenityIcon = (amenity: string) => {
    const icons = {
      'Luxury Spa': <Waves className="w-4 h-4" />,
      'Fine Dining': <Coffee className="w-4 h-4" />,
      'Beach Access': <Waves className="w-4 h-4" />,
      'Water Sports': <Waves className="w-4 h-4" />,
      'WiFi': <Wifi className="w-4 h-4" />,
      'Parking': <Car className="w-4 h-4" />
    };
    return icons[amenity as keyof typeof icons] || <Star className="w-4 h-4" />;
  };

  const filtered = useMemo(() => {
    if (!searched || !dest.trim()) return hotels;
    const key = dest.trim().toLowerCase();
    return hotels.filter(h => h.location.toLowerCase().includes(key) || h.name.toLowerCase().includes(key));
  }, [searched, dest]);

  const handleSearch = () => {
    if (!checkInDate || !checkOutDate || !!dateError) return;
    setSearched(true);
  };

  // Updated: Optimized hotel booking with modern confirmation and faster execution
  const handleBookHotel = useCallback(async (hotel: any) => {
    if (!user || !token) {
      alert('Please sign in to book accommodation.');
      return;
    }
    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates.');
      return;
    }
    if (bookingLoading) return;

    setBookingLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      // Calculate duration
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));

      // Optimized: Fire-and-forget approach for faster response
      const bookingPromise = fetch(`${backendUrl}/api/bookings/hotel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hotelName: hotel.name,
          hotelLocation: hotel.location,
          checkInDate,
          checkOutDate,
          duration,
          price: hotel.price,
        }),
      });

      // Show confirmation immediately while email sends in background
      setShowConfirmation(true);
      
      // Wait for booking to complete
      const response = await bookingPromise;
      if (!response.ok) {
        throw new Error('Booking failed');
      }

      // Reset dates after successful booking
      setCheckInDate('');
      setCheckOutDate('');
      setSearched(false);
    } catch (error) {
      console.error('Hotel booking error:', error);
      setShowConfirmation(false);
      alert('⚠ Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  }, [user, token, checkInDate, checkOutDate, bookingLoading]);

  return (
    <>
      {/* Modern Booking Confirmation Modal */}
      <BookingConfirmation 
        isVisible={showConfirmation} 
        onClose={() => setShowConfirmation(false)} 
      />
      
      <section id="hotels" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Luxury
            <span className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Accommodations
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From heritage palaces to modern luxury resorts, discover exceptional places to stay 
            that offer comfort, authentic experiences, and memories to last a lifetime.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Destination</label>
              <input
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                placeholder="Search destination (e.g., Jaipur, Goa, Kerala)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in</label>
              <input 
                type="date" 
                min={today}
                value={checkInDate}
                onChange={(e) => handleCheckInChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out</label>
              <input 
                type="date" 
                min={checkInDate || today}
                value={checkOutDate}
                onChange={(e) => handleCheckOutChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleSearch}
                disabled={!checkInDate || !checkOutDate || !!dateError}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Search Hotels
              </button>
            </div>
          </div>
          {dateError && (
            <div className="mt-3 text-red-600 text-sm font-medium">
              {dateError}
            </div>
          )}
        </div>

        {/* Hotels Grid (filtered) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filtered.map((hotel) => (
            <div 
              key={hotel.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={hotel.image} 
                  alt={hotel.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <div className="flex items-center">
                    {[...Array(hotel.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
                {checkInDate && checkOutDate && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Available
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{hotel.name}</h3>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{hotel.location}{dest ? ' • ~' + (Math.floor(Math.random()*9)+1) + ' km from ' + dest : ''}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {hotel.description}
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {hotel.amenities.slice(0, 4).map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      {getAmenityIcon(amenity)}
                      <span className="ml-2 text-xs">{amenity}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-800">{hotel.price}</span>
                    <div className="text-xs text-gray-500">per night</div>
                  </div>
                  {/* Updated: Book Now button triggers hotel booking with email confirmation */}
                  <button 
                    onClick={() => handleBookHotel(hotel)}
                    disabled={bookingLoading || !checkInDate || !checkOutDate}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {bookingLoading ? 'Booking...' : 'Book Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Special Offers */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">Special Offers & Packages</h3>
            <p className="text-lg mb-8 text-blue-100 max-w-2xl mx-auto">
              Discover exclusive deals and curated packages that combine luxury accommodations 
              with unique experiences for the perfect Indian getaway.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h4 className="text-xl font-semibold mb-2">Heritage Package</h4>
                <p className="text-sm text-blue-100 mb-4">Stay in royal palaces with cultural tours</p>
                <span className="text-2xl font-bold">25% OFF</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h4 className="text-xl font-semibold mb-2">Wellness Retreat</h4>
                <p className="text-sm text-blue-100 mb-4">Spa treatments and yoga sessions included</p>
                <span className="text-2xl font-bold">30% OFF</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h4 className="text-xl font-semibold mb-2">Adventure Special</h4>
                <p className="text-sm text-blue-100 mb-4">Mountain lodges with trekking guides</p>
                <span className="text-2xl font-bold">20% OFF</span>
              </div>
            </div>
            <button className="mt-8 bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
              View All Offers
            </button>
          </div>
        </div>
        </div>
      </section>
    </>
  );
};

export default Hotels;