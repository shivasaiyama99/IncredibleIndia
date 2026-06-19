import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Star,
  Camera,
  Thermometer,
  Users,
  AlertCircle,
  Heart,
  Share2,
  Check,
} from 'lucide-react';
import { Destination } from '../types';
import GuideInfo from './GuideInfo';
import BookGuideModal from './BookGuideModal';
import { CulturalDestination } from '../types/Cultural';
import { useWishlist } from '../contexts/WishlistContext';

interface DestinationDetailProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination | CulturalDestination | null;
}

const DestinationDetail: React.FC<DestinationDetailProps> = ({
  isOpen,
  onClose,
  destination,
}) => {
  const { addToWishlist, isInWishlist } = useWishlist();
  const [shareMessage, setShareMessage] = useState('');
  const [isGuideInfoOpen, setIsGuideInfoOpen] = useState(false);
  const [isBookGuideOpen, setIsBookGuideOpen] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);

  if (!isOpen || !destination) return null;

  // ✅ handle name/title properly
  const destinationTitle =
    'name' in destination ? destination.name : destination.title;

const handleAddToWishlist = () => {
  addToWishlist(destination as Destination); // ✅ cast here
};


  const handleShareDestination = async () => {
    const slug = destinationTitle.toLowerCase().replace(/\s+/g, '-');
    const shareLink = `https://incredibleindia.com/destination/${slug}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      setShareMessage(
        `Link copied! Share this destination with your friends: ${shareLink}`
      );
      setTimeout(() => setShareMessage(''), 5000);
    } catch {
      setShareMessage(`Share this destination: ${shareLink}`);
      setTimeout(() => setShareMessage(''), 5000);
    }
  };

  // ✅ Detailed info fallback for both types
  const detailedInfo = {
    overview: destination.description,
    history: getHistoryInfo(destinationTitle),
    thingsToDo: getThingsToDo(destinationTitle),
    nearbyAttractions: getNearbyAttractions(destinationTitle),
    travelTips: getTravelTips(destinationTitle),
    weather: getWeatherInfo(),
  };

  // -------------------------
  // Mock Info Helpers
  // -------------------------
  function getHistoryInfo(destinationName: string): string {
    const historyMap: Record<string, string> = {
      'Taj Mahal':
        'Built between 1632-1653 by Mughal Emperor Shah Jahan as a mausoleum for his wife Mumtaz Mahal...',
      'Kerala Backwaters':
        'The backwaters are a network of brackish lagoons and lakes...',
      'Ladakh':
        'Known as "Little Tibet," Ladakh was an important stopover on trade routes...',
      'Rajasthan Palaces':
        "Rajasthan's palaces were built by various Rajput dynasties from the 8th century onwards...",
      'Goa Beaches':
        'Goa was a Portuguese colony for over 450 years, influencing architecture and culture...',
      Varanasi:
        'One of the oldest continuously inhabited cities in the world, with 3000+ years of history...',
    };
    return (
      historyMap[destinationName] ||
      'Rich in history and cultural significance, this destination offers visitors a glimpse into India\'s diverse heritage.'
    );
  }

  function getThingsToDo(destinationName: string): string[] {
    const activitiesMap: Record<string, string[]> = {
      'Taj Mahal': [
        'Visit the main mausoleum at sunrise',
        'Explore the Mughal gardens',
        'Visit Agra Fort and Mehtab Bagh',
      ],
      'Kerala Backwaters': [
        'Stay overnight on a traditional houseboat',
        'Watch local fishermen using Chinese fishing nets',
      ],
    };
    return (
      activitiesMap[destinationName] || [
        'Explore local attractions',
        'Experience authentic local cuisine',
        'Shop for traditional handicrafts',
      ]
    );
  }

  function getNearbyAttractions(destinationName: string): string[] {
    const nearbyMap: Record<string, string[]> = {
      'Taj Mahal': ['Agra Fort (2 km)', 'Fatehpur Sikri (40 km)'],
      'Kerala Backwaters': ['Kumarakom Bird Sanctuary', 'Vembanad Lake'],
    };
    return (
      nearbyMap[destinationName] || [
        'Local temples and monuments',
        'Traditional markets',
      ]
    );
  }

  function getTravelTips(destinationName: string): string[] {
    const tipsMap: Record<string, string[]> = {
      'Taj Mahal': [
        'Book tickets online in advance',
        'Visit early morning or late afternoon',
      ],
      'Kerala Backwaters': [
        'Book houseboats from authorized operators',
        'Carry mosquito repellent',
      ],
    };
    return (
      tipsMap[destinationName] || [
        'Respect local customs and traditions',
        'Carry valid identification',
      ]
    );
  }

  function getWeatherInfo(): {
    season: string;
    temp: string;
    description: string;
  }[] {
    return [
      {
        season: 'Winter (Oct-Mar)',
        temp: '15-25°C',
        description: 'Pleasant weather, ideal for sightseeing',
      },
      {
        season: 'Summer (Apr-Jun)',
        temp: '25-40°C',
        description: 'Hot weather, early morning visits recommended',
      },
      {
        season: 'Monsoon (Jul-Sep)',
        temp: '20-30°C',
        description: 'Rainy season, lush green landscapes',
      },
    ];
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Hero Image */}
          <div className="relative h-64 md:h-80">
            <img
              src={destination.image}
              alt={destinationTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {destinationTitle}
              </h1>
              <div className="flex items-center space-x-4">
                {'state' in destination && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{destination.state}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{destination.duration}</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span>4.8 (2.1k reviews)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Share Message */}
            {shareMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 text-sm">{shareMessage}</p>
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800">Best Time</h3>
                <p className="text-sm text-gray-600">{destination.bestTime}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800">Duration</h3>
                <p className="text-sm text-gray-600">{destination.duration}</p>
              </div>
              {'category' in destination && (
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800">Category</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {destination.category}
                  </p>
                </div>
              )}
            </div>

            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Overview</h2>
              <p className="text-gray-600 leading-relaxed">
                {detailedInfo.overview}
              </p>
            </section>

            {/* History */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                History & Significance
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {detailedInfo.history}
              </p>
            </section>

            {/* Weather */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                <Thermometer className="w-6 h-6 inline mr-2" />
                Weather & Climate
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {detailedInfo.weather.map((season, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {season.season}
                    </h3>
                    <p className="text-orange-600 font-semibold mb-1">
                      {season.temp}
                    </p>
                    <p className="text-sm text-gray-600">{season.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Things to Do */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                <Camera className="w-6 h-6 inline mr-2" />
                Things to Do
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detailedInfo.thingsToDo.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{activity}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Nearby Attractions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Nearby Attractions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detailedInfo.nearbyAttractions.map((attraction, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span className="text-gray-700">{attraction}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Travel Tips */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                <AlertCircle className="w-6 h-6 inline mr-2" />
                Travel Tips
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {detailedInfo.travelTips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Highlights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Highlights
              </h2>
              <div className="flex flex-wrap gap-2">
                {destination.highlights.map((highlight, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t">
              <button
                onClick={handleAddToWishlist}
                disabled={isInWishlist(destination.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold transition-all ${
                  isInWishlist(destination.id)
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist(destination.id)
                      ? 'fill-current text-red-500'
                      : ''
                  }`}
                />
                <span>
                  {isInWishlist(destination.id)
                    ? 'In Wishlist'
                    : 'Save to Wishlist'}
                </span>
              </button>
              <button
                onClick={handleShareDestination}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                <Share2 className="w-5 h-5" />
                <span>Share Destination</span>
              </button>
              <button
                onClick={() => setIsGuideInfoOpen(true)}
                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-all"
              >
                <span>Find Guides</span>
              </button>
            </div>
            <GuideInfo
              isOpen={isGuideInfoOpen}
              onClose={() => setIsGuideInfoOpen(false)}
              onBook={(id) => { setSelectedGuideId(id); setIsBookGuideOpen(true); }}
              initialDestination={destinationTitle}
            />
            <BookGuideModal
              isOpen={isBookGuideOpen}
              guideId={selectedGuideId}
              onClose={() => setIsBookGuideOpen(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
