import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface SavePlanConfirmationProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * SavePlanConfirmation Component
 * Displays "✅ Booking Confirmed" with checkmark animation when a plan is saved
 * Auto-dismisses after exactly 1 second for instant, non-intrusive feedback
 */
const SavePlanConfirmation: React.FC<SavePlanConfirmationProps> = ({ isVisible, onClose }) => {
  // Auto-dismiss after 1 second
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      onClose();
    }, 1000); // 1 second auto-dismiss
    return () => clearTimeout(timer);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center transform animate-scaleIn">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3 animate-pulse">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">
          ✅ Booking Confirmed
        </h3>
      </div>
    </div>
  );
};

export default SavePlanConfirmation;
