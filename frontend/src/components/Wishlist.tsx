import React from 'react';
import { X, MapPin, Calendar, Clock, Trash2, Heart, Plane } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { Destination } from '../types';

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreDestination: (destination: Destination) => void;
  onPlanTrip: () => void;
}

const Wishlist: React.FC<WishlistProps> = ({ isOpen, onClose, onExploreDestination, onPlanTrip }) => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleRemoveFromWishlist = (destinationId: string) => {
    removeFromWishlist(destinationId);
  };

  const handleExploreDestination = (destination: Destination) => {
    onExploreDestination(destination);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
                <p className="text-gray-600">
                  {wishlistItems.length} destination{wishlistItems.length !== 1 ? 's' : ''} saved
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!user ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Sign in to view your wishlist</h3>
              <p className="text-gray-600">Create an account to save your favorite destinations</p>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-6">Start exploring destinations and save your favorites here</p>
              <button
                onClick={() => {
                  onClose();
                  // Navigate/scroll to Destinations after modal closes
                  setTimeout(() => {
                    try {
                      const el = document.getElementById('destinations');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      } else {
                        window.location.hash = '#destinations';
                      }
                    } catch {
                      window.location.hash = '#destinations';
                    }
                  }, 50);
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Explore Destinations
              </button>
            </div>
          ) : (
            <>
              {/* Plan Your Trip Button */}
              <div className="mb-8 text-center">
                <button
                  onClick={onPlanTrip}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 mx-auto"
                >
                  <Plane className="w-6 h-6" />
                  <span>Plan Your Trip</span>
                </button>
                <p className="text-gray-600 mt-2">Create an itinerary with your saved destinations</p>
              </div>

              {/* Wishlist Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item) => (
                  <div
                    key={(item as any)._id || item.destination.id}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={item.destination.image}
                        alt={item.destination.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => handleRemoveFromWishlist(item.destination.id)}
                          className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-colors shadow-lg"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {item.destination.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{item.destination.name}</h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{item.destination.state}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {item.destination.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                          <span>{item.destination.bestTime}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-blue-500" />
                          <span>{item.destination.duration}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.destination.highlights.slice(0, 3).map((highlight, index) => (
                          <span
                            key={index}
                            className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {highlight}
                          </span>
                        ))}
                        {item.destination.highlights.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                            +{item.destination.highlights.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleExploreDestination(item.destination)}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all text-sm"
                        >
                          Explore
                        </button>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Added on {new Date(item.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;