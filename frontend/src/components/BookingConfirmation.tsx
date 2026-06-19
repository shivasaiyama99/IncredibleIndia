import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface BookingConfirmationProps {
  isVisible: boolean;
  onClose: () => void;
  message?: string;
}

/**
 * BookingConfirmation - Modern animated confirmation for successful bookings
 * Replaces outdated alert/popup with professional ✓ animation
 * 
 * Features:
 * - Smooth fade-in animation
 * - Auto-dismiss after 3 seconds
 * - Professional green checkmark design
 * - Non-intrusive overlay
 */
const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ 
  isVisible, 
  onClose, 
  message = "Booking Confirmed Successfully!" 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-dismiss after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center transform animate-scaleIn">
        {/* Success Icon with pulse animation */}
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-pulse">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        {/* Success Message */}
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          ✅ {message}
        </h3>
        
        {/* Subtitle */}
        <p className="text-gray-600 text-sm">
          A confirmation email has been sent to you.
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;
