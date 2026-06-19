import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Header from './components/Header';
import PlansModal from './components/PlansModal.tsx';
import Hero from './components/Hero';
import Destinations from './components/Destinations';
import Hotels from './components/Hotels';
// import Culture from './components/Culture'; // Removed per requirement
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import TripPlanModal from './components/TripPlanModal';
import ItineraryPreview from './components/ItineraryPreview';
import DestinationDetail from './components/DestinationDetail';
import Notification from './components/notification';
import Wishlist from './components/Wishlist';
import BookingModal from './components/BookingModal';
import Chatbot from './components/Chatbot';
import FloatingSOS from './components/FloatingSOS'; // Added: Floating SOS button for active trips
// import TripsSection from './components/TripsSection';
import SafetyCheckModal from './components/SafetyCheckModal';
import SavePlanConfirmation from './components/SavePlanConfirmation'; // Added: 1-second confirmation for Save Plan
import { Destination, TripPlan, Booking } from './types';
import { useWishlist } from './contexts/WishlistContext';
import { CulturalDestination } from './types/Cultural';
import GuideInfo from './components/GuideInfo';
import AllDestinations from './components/AllDestinations';
import BookGuideModal from './components/BookGuideModal';
import GuideBookings from './components/GuideBookings';

function AppContent() {
  // --- STATE MANAGEMENT FOR MODALS ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTripPlanModalOpen, setIsTripPlanModalOpen] = useState(false);
  const [isItineraryPreviewOpen, setIsItineraryPreviewOpen] = useState(false);
  const [isDestinationDetailOpen, setIsDestinationDetailOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSafetyCheckOpen, setIsSafetyCheckOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [isGuideInfoOpen, setIsGuideInfoOpen] = useState(false);
  const [isBookGuideOpen, setIsBookGuideOpen] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [isGuideBookingsOpen, setIsGuideBookingsOpen] = useState(false);
  const [isAllDestinationsOpen, setIsAllDestinationsOpen] = useState(false);
  const [showSavePlanConfirmation, setShowSavePlanConfirmation] = useState(false); // Added: Save Plan checkmark

  // --- STATE MANAGEMENT FOR DATA ---
  const [selectedDestination, setSelectedDestination] = useState<Destination | CulturalDestination | null>(null);
  const [currentTripPlan, setCurrentTripPlan] = useState<TripPlan | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  // Added: Loading states to prevent duplicate operations
  const [isSavingItinerary, setIsSavingItinerary] = useState(false);
  const [isBookingTrip, setIsBookingTrip] = useState(false);
  // Added: Track safety check response and email timer
  const [safetyEmailTimer, setSafetyEmailTimer] = useState<NodeJS.Timeout | null>(null);

  // Auth context
  const { user, token } = useAuth();
  const { removeFromWishlist } = useWishlist();

  // Clear trip plan when user logs out
  useEffect(() => {
    if (!user) {
      setCurrentTripPlan(null);
    }
  }, [user]);

  // --- HANDLERS ---
  // Optimized: Memoized handler for better performance
  const handleStartJourney = useCallback(() => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsTripPlanModalOpen(true);
  }, [user]);

  const handleSignInClick = useCallback(() => setIsAuthModalOpen(true), []);
  const handleWishlistClick = useCallback(() => setIsWishlistModalOpen(true), []);
  const handleAuthSuccess = useCallback(() => setIsAuthModalOpen(false), []);

  // Optimized: Memoized handler for destination exploration
  const handleExploreDestination = useCallback((destination: Destination | CulturalDestination) => {
    setSelectedDestination(destination);
    setIsDestinationDetailOpen(true);
  }, []);

  // Cultural destination flow removed with Culture section

  // Optimized: Memoized handler to prevent unnecessary re-renders
  const handleTripPlanSubmit = useCallback((plan: TripPlan) => {
    setCurrentTripPlan(plan);
    setIsTripPlanModalOpen(false);
    setIsItineraryPreviewOpen(true);
  }, []);

  // Optimized: Memoized handler for trip editing
  const handleEditTrip = useCallback(() => {
    setIsItineraryPreviewOpen(false);
    setIsTripPlanModalOpen(true); // ✅ opens modal with prefilled data now
  }, []);

  // Optimized: Memoized booking handler with better performance
  const handleBookNow = useCallback(async () => {
    if (!currentTripPlan || !token) {
      alert('You must be logged in to book.');
      return;
    }
    // Prevent duplicate booking requests
    if (isBookingTrip) return;
    
    setIsBookingTrip(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const resp = await axios.post('/api/bookings', currentTripPlan, config);
      const newBooking: Booking | undefined = resp?.data?.booking;
      
      // Optimized: Parallel wishlist removal for faster execution
      if (currentTripPlan.selectedDestinations && currentTripPlan.selectedDestinations.length > 0) {
        const removalPromises = currentTripPlan.selectedDestinations.map(d => 
          removeFromWishlist(d.id).catch(e => console.error('Wishlist removal failed:', e))
        );
        await Promise.all(removalPromises);
      }
      
      setIsItineraryPreviewOpen(false);
      setIsBookingModalOpen(true);
      setCurrentTripPlan(null);
      if (newBooking) setCurrentBooking(newBooking);
      alert('Trip booked successfully!');
    } catch (e) {
      console.error('Booking failed', e);
      alert('Booking failed.');
    } finally {
      setIsBookingTrip(false);
    }
  }, [currentTripPlan, token, isBookingTrip, removeFromWishlist]);

  // Updated: Safety check with 3-minute background email timer
  useEffect(() => {
    if (!currentBooking?.safetyMonitoring || !currentBooking?.startDate || !currentBooking?.endDate) return;
    let timer: any;
    let interval: any;
    const start = new Date(currentBooking.startDate as any);
    const end = new Date(currentBooking.endDate as any);
    // Use user-configured frequency (in minutes), defaulting to 3
    const intervalMinutes = Math.max(1, Number(currentBooking.safetyFrequencyMinutes || 3));
    const tick = () => {
      const now = new Date();
      if (now >= start && now <= end) {
        setIsSafetyCheckOpen(true);
        
        // Start 3-minute background timer for emergency email (if no response)
        console.log('[SafetyCheck] Starting 3-minute background email timer');
        const bookingIdSnapshot = currentBooking._id; // Capture booking ID
        const emailTimer = setTimeout(async () => {
          // Verify booking still exists before sending email (prevents alerts for deleted trips)
          if (!currentBooking || currentBooking._id !== bookingIdSnapshot) {
            console.log('[SafetyCheck] Trip was deleted - cancelling email send');
            return;
          }
          console.log('[SafetyCheck] 3 minutes elapsed with no response - sending emergency email');
          try {
            await fetch((import.meta.env.VITE_BACKEND_URL || '') + `/api/safety/alert`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ bookingId: bookingIdSnapshot }),
            });
            console.log('[SafetyCheck] Emergency email sent successfully');
          } catch (error) {
            console.error('[SafetyCheck] Failed to send emergency email:', error);
          }
        }, 3 * 60 * 1000); // 3 minutes
        setSafetyEmailTimer(emailTimer);
      }
    };
    const schedule = () => {
      const now = new Date();
      if (now < start) {
        timer = setTimeout(() => {
          tick();
          // Use dynamic frequency minutes
          interval = setInterval(tick, intervalMinutes * 60 * 1000);
        }, start.getTime() - now.getTime());
      } else if (now >= start && now <= end) {
        // Use dynamic frequency minutes
        interval = setInterval(tick, intervalMinutes * 60 * 1000);
      }
    };
    schedule();
    return () => { 
      if (timer) clearTimeout(timer); 
      if (interval) clearInterval(interval); 
      // Clear any pending email timers when booking changes
      if (safetyEmailTimer) clearTimeout(safetyEmailTimer);
    };
  }, [currentBooking, token]);

  // Added: Handler when user responds to safety check (cancels email timer)
  const handleSafetyResponse = useCallback((responded: boolean) => {
    if (responded && safetyEmailTimer) {
      console.log('[SafetyCheck] User responded - cancelling 3-minute email timer');
      clearTimeout(safetyEmailTimer);
      setSafetyEmailTimer(null);
    }
  }, [safetyEmailTimer]);

  // Added: Handler to clear current booking when deleted (cancels all alerts)
  const handleDeleteBooking = useCallback((deletedPlanId: string) => {
    // If the deleted plan is the current booking, clear it to cancel alerts
    if (currentBooking?._id === deletedPlanId) {
      setCurrentBooking(null);
      setIsSafetyCheckOpen(false); // Close any open safety check modal
      // Cancel any pending email timer
      if (safetyEmailTimer) {
        clearTimeout(safetyEmailTimer);
        setSafetyEmailTimer(null);
      }
    }
  }, [currentBooking, safetyEmailTimer]);

  // Updated: Save Plan now saves as Booked (not Planned) with 1-second checkmark confirmation
  const handleSaveItinerary = useCallback(async (itineraryText: string) => {
    if (!currentTripPlan || !token) {
      // Silent feedback - show brief error in console only
      console.error('User must be logged in to save plan');
      return;
    }
    // Prevent duplicate save requests
    if (isSavingItinerary) return;

    const planToSave = { ...currentTripPlan, itineraryText };

    setIsSavingItinerary(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Updated: Save as booking (Booked status) instead of trip plan (Planned status)
      const response = await axios.post('/api/bookings', planToSave, config);
      const newBooking: Booking | undefined = response?.data?.booking;
      
      // Optimized: Parallel wishlist removal for faster execution
      if (currentTripPlan.selectedDestinations && currentTripPlan.selectedDestinations.length > 0) {
        const removalPromises = currentTripPlan.selectedDestinations.map(d => 
          removeFromWishlist(d.id).catch(e => console.error('Wishlist removal failed:', e))
        );
        await Promise.all(removalPromises);
      }
      
      // Updated: Show 1-second checkmark confirmation instead of alert
      setShowSavePlanConfirmation(true);
      
      // Updated: Store as current booking for safety monitoring
      if (newBooking) setCurrentBooking(newBooking);
      
      // Note: Trip plan box already closes immediately (handled in ItineraryPreview)
      setIsItineraryPreviewOpen(false);
      setCurrentTripPlan(null);
    } catch (error) {
      console.error('Failed to save plan:', error);
      // Show brief error without blocking UX
      alert('Failed to save plan. Please try again.');
    } finally {
      setIsSavingItinerary(false);
    }
  }, [currentTripPlan, token, isSavingItinerary, removeFromWishlist]);

  // Determine if there's an active trip (trip has started but not ended)
  const isActiveTripRunning = () => {
    if (!currentBooking || !currentBooking.safetyMonitoring) return false;
    const now = new Date();
    const start = new Date(currentBooking.startDate as any);
    const end = new Date(currentBooking.endDate as any);
    return now >= start && now <= end;
  };

  // SOS handler (reusable for floating button)
  const handleSOSClick = async () => {
    if (!user || !token) { alert('Please sign in to use SOS.'); return; }
    try {
      // Try to get last-known location (optional)
      const getLocation = () => new Promise<string | undefined>((resolve) => {
        try {
          if (!navigator.geolocation) return resolve(undefined);
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              resolve(`${latitude.toFixed(5)},${longitude.toFixed(5)}`);
            },
            () => resolve(undefined),
            { timeout: 3000 }
          );
        } catch {
          resolve(undefined);
        }
      });
      const location = await getLocation();
      const bookingId = currentBooking?._id;
      await fetch((import.meta.env.VITE_BACKEND_URL || '') + '/api/safety/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId, location }),
      });
      alert('🚨 SOS Alert Sent to Your Trusted Contact.');
    } catch (e) {
      console.error('SOS error', e);
      alert('Failed to send SOS alert.');
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        onSignInClick={handleSignInClick}
        onWishlistClick={handleWishlistClick}
        onPlansClick={() => setIsPlansOpen(true)}
        onFindGuides={() => setIsGuideInfoOpen(true)}
        onGuideBookings={() => setIsGuideBookingsOpen(true)}
      />
      <Hero onStartJourney={handleStartJourney} />
      <Destinations onExploreDestination={handleExploreDestination} onViewAll={() => setIsAllDestinationsOpen(true)} />
      <Hotels />
      {/* Culture section removed per requirement */}
      {/* Removed My Plans/My Bookings section from home per new nav placement */}
      <Footer />

      {/* Chatbot floating widget */}
      <Chatbot />
      
      {/* Floating SOS button - appears only during active trips */}
      <FloatingSOS 
        isVisible={isActiveTripRunning()} 
        onSOS={handleSOSClick} 
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <Wishlist
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        onExploreDestination={handleExploreDestination}
        onPlanTrip={() => {
          setIsWishlistModalOpen(false);
          setIsTripPlanModalOpen(true);
        }}
      />

      {/* ✅ Pass existing plan to modal if editing */}
      <TripPlanModal
        isOpen={isTripPlanModalOpen}
        onClose={() => setIsTripPlanModalOpen(false)}
        onSubmit={handleTripPlanSubmit}
        onFindGuides={() => { setIsGuideInfoOpen(true); setSelectedGuideId(null); }}
        initialData={currentTripPlan ? {
          destination: currentTripPlan.destination,
          budget: currentTripPlan.budget,
          tripType: currentTripPlan.tripType,
          safetyMonitoring: currentTripPlan.safetyMonitoring,
          trustedContactEmail: currentTripPlan.trustedContactEmail,
          safetyFrequencyMinutes: currentTripPlan.safetyFrequencyMinutes,
          numberOfPeople: currentTripPlan.numberOfPeople,
          startDate: currentTripPlan.startDate ? new Date(currentTripPlan.startDate).toISOString().split('T')[0] : '',
          endDate: currentTripPlan.endDate ? new Date(currentTripPlan.endDate).toISOString().split('T')[0] : '',
          selectedDestinations: currentTripPlan.selectedDestinations || [],
        } : undefined}
      />

      <ItineraryPreview
        isOpen={isItineraryPreviewOpen}
        tripPlan={currentTripPlan}
        onClose={() => setIsItineraryPreviewOpen(false)}
        onSave={handleSaveItinerary}
        onEdit={handleEditTrip}
        onBookNow={handleBookNow}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      <PlansModal 
        isOpen={isPlansOpen} 
        onClose={() => setIsPlansOpen(false)}
        onDeleteBooking={handleDeleteBooking}
      />

      <AllDestinations
        isOpen={isAllDestinationsOpen}
        onClose={() => setIsAllDestinationsOpen(false)}
        onExploreDestination={handleExploreDestination}
      />

      {/* Guides */}
      <GuideInfo
        isOpen={isGuideInfoOpen}
        onClose={() => setIsGuideInfoOpen(false)}
        onBook={(guideId) => { setSelectedGuideId(guideId); setIsBookGuideOpen(true); }}
        initialDestination={typeof selectedDestination === 'object' && selectedDestination ? (('name' in selectedDestination) ? selectedDestination.name : selectedDestination.title) : ''}
      />
      <BookGuideModal
        isOpen={isBookGuideOpen}
        guideId={selectedGuideId}
        onClose={() => setIsBookGuideOpen(false)}
      />
      <GuideBookings
        isOpen={isGuideBookingsOpen}
        onClose={() => setIsGuideBookingsOpen(false)}
      />

      <DestinationDetail
        isOpen={isDestinationDetailOpen}
        onClose={() => setIsDestinationDetailOpen(false)}
        destination={selectedDestination}
      />

      {/* Safety modal controlled by booking dates - popup closes after 15s but 3-min email timer continues */}
      {user && token && currentBooking?.safetyMonitoring && (
        <SafetyCheckModal
          isOpen={isSafetyCheckOpen}
          onClose={() => setIsSafetyCheckOpen(false)}
          planId={currentBooking._id}
          token={token}
          onResponse={handleSafetyResponse}
        />
      )}

      {/* Save Plan Confirmation - 1-second checkmark animation */}
      <SavePlanConfirmation 
        isVisible={showSavePlanConfirmation} 
        onClose={() => setShowSavePlanConfirmation(false)} 
      />
    </div>
  );
}

function App() {
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showNotification = (message: string, type: 'success' | 'error' = 'success') =>
    setNotification({ message, type });

  return (
    <AuthProvider showNotification={showNotification}>
      <WishlistProvider showNotification={showNotification}>
        <AppContent />
      </WishlistProvider>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </AuthProvider>
  );
}

export default App;
