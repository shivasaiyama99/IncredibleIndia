import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Camera, Users, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { CulturalDestination } from '../types/Cultural';

interface CulturalDestinationDetailProps {
  isOpen: boolean;
  onClose: () => void;
  destination: CulturalDestination | null;
}

const CulturalDestinationDetail: React.FC<CulturalDestinationDetailProps> = ({ 
  isOpen, 
  onClose, 
  destination 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  if (!isOpen || !destination) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === destination.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? destination.images.length - 1 : prev - 1
    );
  };

  const today = new Date().toISOString().split('T')[0];

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate >= today) {
      setCheckInDate(selectedDate);
      // Reset checkout date if it's before the new check-in date
      if (checkOutDate && checkOutDate <= selectedDate) {
        setCheckOutDate('');
      }
    }
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (checkInDate && selectedDate > checkInDate) {
      setCheckOutDate(selectedDate);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          <div className="relative h-80 overflow-hidden">
            <img 
              src={destination.images[currentImageIndex]} 
              alt={destination.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* Image Navigation */}
            {destination.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {destination.images.map((_, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Title Overlay */}
            <div className="absolute bottom-6 left-6 text-white">
              <div className="flex items-center mb-2">
                {destination.icon && <div className="text-orange-400 mr-3">{destination.icon}</div>}
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Cultural Heritage
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-2">{destination.title}</h1>
              <p className="text-xl text-gray-200">{destination.description}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Detailed Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Cultural Experience</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {destination.detailedDescription}
                </p>
              </div>

              {/* History */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Historical Background</h2>
                <p className="text-gray-600 leading-relaxed">
                  {destination.history}
                </p>
              </div>

              {/* Highlights */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Experience Highlights</h2>
                <div className="space-y-3">
                  {destination.highlights.map((highlight: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <Star className="w-5 h-5 text-orange-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Images Grid */}
              {destination.images.length > 1 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {destination.images.map((image: string, index: number) => (
                      <div 
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img 
                          src={image} 
                          alt={`${destination.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Quick Info */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <div className="font-semibold text-gray-800">Best Time to Visit</div>
                      <div className="text-gray-600 text-sm">{destination.bestTime}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <div className="font-semibold text-gray-800">Duration</div>
                      <div className="text-gray-600 text-sm">{destination.duration}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <div className="font-semibold text-gray-800">Experience Type</div>
                      <div className="text-gray-600 text-sm">Cultural Immersion</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white mb-6">
                <h3 className="text-xl font-bold mb-4">Plan Your Visit</h3>
                <p className="text-orange-100 text-sm mb-4">
                  Please select your check-in and check-out dates for your stay. The check-in date cannot be earlier than today, and the check-out date must be after the check-in date.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Check-in Date</label>
                    <input
                      type="date"
                      value={checkInDate}
                      min={today}
                      onChange={handleCheckInChange}
                      className="w-full px-3 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Check-out Date</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      min={checkInDate || today}
                      onChange={handleCheckOutChange}
                      disabled={!checkInDate}
                      className="w-full px-3 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  <button 
                    disabled={!checkInDate || !checkOutDate}
                    className="w-full bg-white text-orange-600 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Book Experience
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-orange-600 mr-3" />
                    <span className="text-gray-700">Local Cultural Guide Available</span>
                  </div>
                  <div className="flex items-center">
                    <Camera className="w-5 h-5 text-orange-600 mr-3" />
                    <span className="text-gray-700">Photography Assistance</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-orange-600 mr-3" />
                    <span className="text-gray-700">Group Bookings Available</span>
                  </div>
                </div>
                
                <button className="w-full mt-4 bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  Contact Cultural Ambassador
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CulturalDestinationDetail;