import { useEffect, useState } from 'react';
import { Menu, X, User, LogOut, Heart, CalendarDays } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import logo from './logo.jpg';

// Define the props interface to accept both click handlers
interface HeaderProps {
  onSignInClick: () => void;
  onWishlistClick: () => void;
  onPlansClick?: () => void;
  onFindGuides?: () => void;
  onGuideBookings?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignInClick, onWishlistClick, onPlansClick, onFindGuides, onGuideBookings }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { wishlistItems } = useWishlist(); // Get wishlist items to show a count

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollHome = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const wrapClasses = atTop
    ? 'fixed top-0 z-50 w-full bg-transparent transition-colors'
    : 'fixed top-0 z-50 w-full bg-white shadow-lg transition-colors';

  const linkBase = atTop ? 'text-white hover:text-orange-200' : 'text-gray-700 hover:text-orange-600';

  return (
    <header className={wrapClasses}>
      <div className="container mx-auto px-4">
        {/* Top Bar removed */}

        {/* Main Navigation */}
        <div className="flex items-center justify-between py-4">
          {/* Logo and Title (clickable) */}
          <button onClick={scrollHome} className="flex items-center space-x-3 group" aria-label="Go to Home">
            <img
              src={logo}
              alt="Incredible India logo"
              className={`w-12 h-12 rounded-full object-cover ring-2 ${atTop ? 'ring-white/70' : 'ring-orange-500/70'} group-hover:scale-105 transition-transform`}
            />
            <div className="text-left">
              <h1 className={`text-2xl font-bold ${atTop ? 'text-white' : 'text-gray-800'}`}>Incredible India</h1>
              <p className={`text-sm ${atTop ? 'text-white/80' : 'text-gray-600'}`}>Discover the Land of Wonders</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#destinations" className={`transition-colors font-medium ${linkBase}`}>Destinations</a>
            <a href="#hotels" className={`transition-colors font-medium ${linkBase}`}>Stay</a>
            <button onClick={onFindGuides} className={`transition-colors font-medium ${linkBase}`}>Find Guides</button>
          </nav>
          
          {/* Right side icons and buttons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist button */}
            <button 
              onClick={onWishlistClick}
              className={`relative p-2 rounded-full transition-colors ${atTop ? 'text-white hover:text-red-400 hover:bg-white/10' : 'text-gray-600 hover:text-red-500 hover:bg-gray-100'}`}
              title="Open Wishlist"
            >
              <Heart className="w-6 h-6" />
              {user && wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </button>
          {/* My Plans button */}
          <button
            onClick={onPlansClick}
            className={`relative p-2 rounded-full hidden lg:inline-flex transition-colors ${atTop ? 'text-white hover:text-orange-200 hover:bg-white/10' : 'text-gray-600 hover:text-orange-600 hover:bg-gray-100'}`}
            title="My Plans"
          >
            <CalendarDays className="w-6 h-6" />
          </button>
          {/* Guide Bookings button (visible only for guides) */}
          {user?.role === 'guide' && (
            <button
              onClick={onGuideBookings}
              className={`hidden lg:inline-flex px-3 py-2 text-sm rounded-full border ${atTop ? 'border-white/30 text-white hover:bg-white/10' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}`}
              title="My Guide Bookings"
            >
              My Bookings
            </button>
          )}
            
            <div className="hidden lg:flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className={`w-5 h-5 ${atTop ? 'text-white' : 'text-gray-600'}`} />
                    <span className={`${atTop ? 'text-white' : 'text-gray-700'} font-medium`}>{user.name}</span>
                  </div>
                  <button onClick={logout} className={`flex items-center space-x-2 transition-colors ${atTop ? 'text-white hover:text-red-400' : 'text-gray-600 hover:text-red-600'}`}>
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button onClick={onSignInClick} className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all">
                  Sign In
                </button>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button onClick={toggleMenu} className={`lg:hidden p-2 rounded-lg transition-colors ${atTop ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`lg:hidden py-4 border-t ${atTop ? 'border-white/20' : 'border-gray-200'}`}>
            <nav className="flex flex-col space-y-4">
              <a href="#destinations" className={`transition-colors font-medium px-2 py-1 ${linkBase}`}>Destinations</a>
              <a href="#hotels" className={`transition-colors font-medium px-2 py-1 ${linkBase}`}>Stay</a>
              <button onClick={onFindGuides} className={`text-left transition-colors font-medium px-2 py-1 ${linkBase}`}>Find Guides</button>

              {user ? (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center space-x-2 px-2">
                    <User className={`w-5 h-5 ${atTop ? 'text-white' : 'text-gray-600'}`} />
                    <span className={`${atTop ? 'text-white' : 'text-gray-700'} font-medium`}>{user.name}</span>
                  </div>
                  {/* Toggle: Safety popup sound */}
                  <button
                    onClick={() => {
                      try {
                        const cur = localStorage.getItem('safetySoundEnabled');
                        const next = cur === 'false' ? 'true' : 'false';
                        localStorage.setItem('safetySoundEnabled', next);
                        alert(next === 'true' ? 'Safety sound enabled' : 'Safety sound disabled');
                      } catch {}
                    }}
                    className={`w-full text-left px-3 py-2 rounded ${atTop ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    Toggle Safety Sound
                  </button>
                  {user.role === 'guide' && (
                    <button onClick={onGuideBookings} className={`w-full text-left px-2 py-2 ${linkBase}`}>My Bookings</button>
                  )}
                  <button onClick={logout} className={`flex items-center space-x-2 w-full transition-colors py-2 px-2 ${atTop ? 'text-red-300 hover:text-red-400' : 'text-red-600 hover:text-red-700'}`}>
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button onClick={onSignInClick} className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all w-full">
                  Sign In
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

