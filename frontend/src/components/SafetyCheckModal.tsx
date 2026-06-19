import React, { useEffect } from 'react';
import { X, ShieldCheck, ThumbsUp, AlertTriangle } from 'lucide-react';

interface SafetyCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  token: string;
  onResponse: (responded: boolean) => void; // Added: Track if user responded
}

const SafetyCheckModal: React.FC<SafetyCheckModalProps> = ({ isOpen, onClose, planId, token, onResponse }) => {
  if (!isOpen) return null;

  // Updated: Auto-dismiss popup after 15 seconds (non-blocking UX)
  // Email will be sent by parent component after 3 minutes if no response
  useEffect(() => {
    if (!isOpen) return;
    console.log('[SafetyCheck] Popup appeared - will auto-close in 15 seconds');
    const t = setTimeout(() => {
      console.log('[SafetyCheck] No response yet - closing popup (email timer continues in background)');
      onClose(); // Close popup to avoid blocking monitor
      // Note: Parent component will send email after 3 minutes if onResponse(true) never called
    }, 15 * 1000); // 15 seconds - popup closes but timer continues in parent
    return () => clearTimeout(t);
  }, [isOpen, onClose]);

  // Updated: Play a loud 3-second alert tone each time the popup becomes visible
  useEffect(() => {
    if (!isOpen) return;
    // Read toggle from localStorage; default to true if not set
    let enabled = true;
    try {
      const v = localStorage.getItem('safetySoundEnabled');
      if (v !== null) enabled = v === 'true';
    } catch {}
    if (!enabled) return;
    // Use Web Audio API to generate a loud 3-second alert tone for better attention-grabbing
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880; // A5 (attention-grabbing frequency)
      // Updated: Higher volume (0.5) and 3-second duration
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 1.5);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 3.0); // Play for 3 seconds
      // Close audio context after sound completes
      setTimeout(() => { try { ctx.close(); } catch {} }, 3200);
    } catch {}
  }, [isOpen]);

  // Updated: Immediate close on Yes/No, notify parent that user responded
  const handle = async (resp: 'yes' | 'no') => {
    // Notify parent that user responded (cancels 3-minute email timer)
    onResponse(true);
    
    // Close popup immediately for better UX
    onClose();
    
    try {
      // Record safety response
      await fetch((import.meta.env.VITE_BACKEND_URL || '') + `/api/bookings/${planId}/safety`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ response: resp }),
      });
      
      // If user selects "No", send emergency alert email immediately
      if (resp === 'no') {
        console.log('[SafetyCheck] User clicked NO - sending emergency email immediately');
        await fetch((import.meta.env.VITE_BACKEND_URL || '') + `/api/safety/alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ bookingId: planId }),
        });
      }
    } catch (error) {
      console.error('Safety response error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full text-center p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-6 h-6 text-gray-500" />
        </button>
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Are you safe?</h3>
        <p className="text-gray-600 mb-6">Please confirm your safety status.</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handle('yes')} className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2">
            <ThumbsUp className="w-4 h-4" /> Yes
          </button>
          <button onClick={() => handle('no')} className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" /> No
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyCheckModal;


