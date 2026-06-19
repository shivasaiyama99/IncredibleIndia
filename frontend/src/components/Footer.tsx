import React, { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, ChevronDown } from 'lucide-react';
import logo from './logo.jpg';

// Dark-themed FAQ content for footer
const footerFaqs = [
  {
    q: 'How can I book a destination?',
    a: 'Explore destinations and click “Explore Destination” to view details and booking options.',
  },
  {
    q: 'Do I need an account to use the wishlist?',
    a: 'Yes, please sign in to add destinations to your wishlist.',
  },
  {
    q: 'Can I cancel or change my booking?',
    a: 'Yes, cancellation and modification policies are available in the booking section.',
  },
  {
    q: 'Is the website accessible on mobile devices?',
    a: 'Yes, the site is fully responsive and works on all devices.',
  },
];

const FooterAccordionItem: React.FC<{ q: string; a: string; index: number }> = ({ q, a, index }) => {
  const [open, setOpen] = useState(false);
  const id = `footer-faq-${index}`;
  return (
    <div className="bg-gray-800/70 border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between px-4 md:px-5 py-4 text-left hover:bg-gray-800 transition-colors"
      >
        <span className="font-semibold text-gray-100">{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        id={id}
        className={`px-4 md:px-5 text-gray-300 transition-all duration-300 ease-in-out ${open ? 'max-h-40 py-3 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
      >
        {a}
      </div>
    </div>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* FAQ Section inside Footer */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white">
              Frequently Asked <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="mt-2 text-gray-300">Quick answers about booking, wishlist, and accessibility.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {footerFaqs.map((f, i) => (
              <FooterAccordionItem key={i} q={f.q} a={f.a} index={i} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img
                src={logo}
                alt="Incredible India logo"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/70"
              />
              <div>
                <h3 className="text-2xl font-bold">Incredible India</h3>
                <p className="text-gray-400">Discover the Land of Wonders</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Experience the magic of India through our carefully curated destinations, 
              authentic experiences, and local connections that create memories to last a lifetime.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-orange-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-orange-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-orange-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-orange-600 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#destinations" className="text-gray-300 hover:text-orange-400 transition-colors">Destinations</a></li>
              <li><a href="#hotels" className="text-gray-300 hover:text-orange-400 transition-colors">Hotels</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Travel Tips</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-400" />
                {/* Updated: Contact number changed to 8106654974 */}
                <span className="text-gray-300">+91-8106654974</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-400" />
                <span className="text-gray-300">info@incredibleindia.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-orange-400 mt-1" />
                <span className="text-gray-300">
                  Ministry of Tourism<br />
                  Government of India<br />
                  New Delhi, India
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="text-lg font-semibold mb-2">Subscribe to Our Newsletter</h4>
              <p className="text-gray-300">Get the latest travel updates and exclusive offers</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="px-4 py-3 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent border border-gray-700"
              />
              <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 Incredible India. All rights reserved. | Privacy Policy | Terms of Service
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;