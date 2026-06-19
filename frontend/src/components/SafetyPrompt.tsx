import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, ThumbsUp, AlertTriangle } from 'lucide-react';

interface SafetyPromptProps {
  planId: string;
  token: string;
}

const SafetyPrompt: React.FC<SafetyPromptProps> = ({ planId, token }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const backendBaseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || '', []);

  // Visibility controlled by parent (based on dates) in App; leaving component-only manual toggle disabled

  const sendResponse = async (resp: 'yes' | 'no') => {
    if (loading) return;
    try {
      setLoading(true);
      await fetch(`${backendBaseUrl}/api/tripplans/${planId}/safety`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ response: resp }),
      });
    } finally {
      setLoading(false);
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[1100] w-80 bg-white border border-blue-200 rounded-2xl shadow-2xl overflow-hidden">
      <div className="px-4 py-2 bg-blue-50 text-blue-800 font-semibold flex items-center gap-2">
        <ShieldCheck className="w-5 h-5" />
        Safety Check-in
      </div>
      <div className="p-4 text-gray-800">
        <p className="mb-3">Are you safe?</p>
        <div className="flex gap-2">
          <button
            disabled={loading}
            onClick={() => sendResponse('yes')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ThumbsUp className="w-4 h-4" /> Yes
          </button>
          <button
            disabled={loading}
            onClick={() => sendResponse('no')}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" /> No
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyPrompt;


