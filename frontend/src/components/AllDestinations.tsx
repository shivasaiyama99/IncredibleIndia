import React, { useState } from 'react';
import { destinations } from '../data/destinations';
import { MapPin, Clock, Calendar, X, Search } from 'lucide-react';
import { Destination } from '../types';

interface AllDestinationsProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreDestination: (destination: Destination) => void;
}

const AllDestinations: React.FC<AllDestinationsProps> = ({ isOpen, onClose, onExploreDestination }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', name: 'All Destinations', count: destinations.length },
    { id: 'heritage', name: 'Heritage', count: destinations.filter(d => d.category === 'heritage').length },
    { id: 'nature', name: 'Nature', count: destinations.filter(d => d.category === 'nature').length },
    { id: 'adventure', name: 'Adventure', count: destinations.filter(d => d.category === 'adventure').length },
    { id: 'spiritual', name: 'Spiritual', count: destinations.filter(d => d.category === 'spiritual').length },
  ];

  const filteredDestinations = destinations.filter(dest => {
    const matchesCategory = activeCategory === 'all' || dest.category === activeCategory;
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold">All Destinations</h2>
              <p className="text-orange-100">We have {destinations.length} amazing destinations for you to explore!</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search destinations, states, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredDestinations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No destinations found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDestinations.map((destination) => (
                <div 
                  key={destination.id} 
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-100"
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-full text-xs font-semibold capitalize">
                        {destination.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{destination.name}</h3>
                      <div className="flex items-center text-orange-600 ml-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="text-xs font-medium">{destination.state}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{destination.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{destination.bestTime}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{destination.duration}</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {destination.highlights.slice(0, 2).map((highlight, index) => (
                          <span 
                            key={index}
                            className="bg-orange-50 text-orange-700 px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {highlight}
                          </span>
                        ))}
                        {destination.highlights.length > 2 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{destination.highlights.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        onExploreDestination(destination);
                        onClose();
                      }}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-semibold text-sm hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                      Explore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllDestinations;