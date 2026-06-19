import React from 'react';
import { experiences } from '../data/experiences';
import { Clock, MapPin, Users, Star } from 'lucide-react';

const Experiences: React.FC = () => {
  const getCategoryColor = (category: string) => {
    const colors = {
      food: 'bg-green-100 text-green-700',
      wellness: 'bg-blue-100 text-blue-700',
      wildlife: 'bg-yellow-100 text-yellow-700',
      culture: 'bg-purple-100 text-purple-700',
      adventure: 'bg-red-100 text-red-700'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <section id="experiences" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Authentic
            <span className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Experiences
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Immerse yourself in India's rich culture through unique experiences that connect you 
            with local traditions, flavors, and the warm hospitality of Indian people.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {experiences.map((experience) => (
            <div 
              key={experience.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={experience.image} 
                  alt={experience.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getCategoryColor(experience.category)}`}>
                    {experience.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-semibold ml-1">4.8</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                  {experience.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {experience.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                    <span>{experience.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2 text-orange-600" />
                    <span>{experience.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2 text-orange-600" />
                    <span>Small group (max 8)</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-800">{experience.price}</span>
                    <span className="text-sm text-gray-500">/person</span>
                  </div>
                  <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Experience */}
        <div className="mt-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">Create Your Custom Experience</h3>
              <p className="text-lg mb-6 text-orange-100">
                Work with our local experts to design a personalized journey that matches your interests, 
                preferences, and travel style. From spiritual retreats to adventure expeditions.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm">Personal Guide</span>
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm">Flexible Itinerary</span>
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm">Local Insights</span>
              </div>
              <button className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
                Plan My Experience
              </button>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg" 
                alt="Custom experience"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experiences;