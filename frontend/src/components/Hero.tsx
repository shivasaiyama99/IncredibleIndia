import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onStartJourney: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartJourney }) => {
  // YouTube background video embed
  const videoSrc =
    'https://www.youtube.com/embed/NFCSP7Wmmn0?autoplay=1&mute=1&controls=0&loop=1&playlist=NFCSP7Wmmn0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1';

  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Video with Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <iframe
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] h-[100vh] md:w-[100vw] md:h-[56.25vw] max-w-none pointer-events-none"
            src={videoSrc}
            title="Incredible India 4K"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <div className="absolute inset-0 bg-black/45"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl">
          
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Incredible
            <span className="block bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              India
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 mb-4 max-w-xl leading-relaxed">
            Discover diverse cultures and breathtaking landscapes across India.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button 
              onClick={onStartJourney}
              className="group bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex flex-wrap gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">29</div>
              <div className="text-gray-300 text-sm">States & UTs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">38</div>
              <div className="text-gray-300 text-sm">UNESCO Sites</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">1000+</div>
              <div className="text-gray-300 text-sm">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">5000+</div>
              <div className="text-gray-300 text-sm">Years History</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator removed */}
    </section>
  );
};

export default Hero;
