import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FloatingSOSProps {
  isVisible: boolean;
  onSOS: () => void;
}

/**
 * FloatingSOS - A floating circular SOS button that appears only during active trips
 * Positioned beside the chatbot with a glowing/pulsing effect
 * 
 * Requirements met:
 * - Appears only when trip is active (controlled by isVisible prop)
 * - Floating circular design matching chatbot style
 * - Red color with glowing pulsing effect
 * - Triggers existing Nodemailer emergency alert via onSOS callback
 */
const FloatingSOS: React.FC<FloatingSOSProps> = ({ isVisible, onSOS }) => {
  if (!isVisible) return null;

  return (
    <button
      onClick={onSOS}
      aria-label="Emergency SOS"
      title="Emergency SOS Alert"
      // Updated: Repositioned to bottom-left corner (left-4) to avoid chatbot interference
      className="fixed bottom-4 left-4 z-[1000] h-14 w-14 rounded-full shadow-2xl bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all animate-pulse"
      style={{
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    >
      <AlertTriangle className="h-7 w-7" />
    </button>
  );
};

export default FloatingSOS;
