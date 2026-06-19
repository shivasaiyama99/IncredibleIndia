import React from 'react';
import { Destination } from '../types';
import { destinations } from '../data/destinations';

interface DestinationsProps {
  onExploreDestination: (destination: Destination) => void;
  onViewAll?: () => void;
}

const Destinations: React.FC<DestinationsProps> = ({ onExploreDestination, onViewAll }) => {
  return (
    <section id="destinations" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Popular Destinations</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => (
            <div 
              key={dest.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onExploreDestination(dest)}
            >
              <img 
                src={dest.image} 
                alt={dest.name} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{dest.name}</h3>
                <p className="text-sm text-gray-500">{dest.state}</p>
                <p className="mt-2 text-gray-600 text-sm line-clamp-3">{dest.description}</p>
                <div className="mt-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); onExploreDestination(dest); }}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-semibold text-sm hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    Explore Destination
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Destinations */}
        <div className="mt-10 text-center">
          <button
            onClick={onViewAll}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
          >
            View All Destinations
          </button>
        </div>
      </div>
    </section>
  );
};

export default Destinations;
