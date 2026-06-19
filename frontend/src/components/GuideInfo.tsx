import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { X, Search, Mail, Phone, Calendar } from 'lucide-react';

interface GuideInfoProps {
  isOpen: boolean;
  onClose: () => void;
  onBook: (guideId: string) => void;
  initialDestination?: string;
}

const GuideInfo: React.FC<GuideInfoProps> = ({ isOpen, onClose, onBook, initialDestination }) => {
  const { token } = useAuth();
  const [destination, setDestination] = useState('');
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const base = '';

  useEffect(() => {
    if (!isOpen) {
      setGuides([]);
      setDestination('');
    } else if (initialDestination) {
      setDestination(initialDestination);
    }
  }, [isOpen, initialDestination]);

  const search = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${base}/api/guide/guides/destination/${encodeURIComponent(destination)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGuides(res.data.guides || []);
    } catch (e) {
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search when opened with a pre-selected destination from the details view
  useEffect(() => {
    if (!isOpen) return;
    if (initialDestination && destination.trim() && guides.length === 0 && !loading) {
      // Trigger initial fetch without requiring user to press Search
      search();
    }
    // We intentionally exclude `guides` and `loading` from deps to avoid repeated calls during fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialDestination, destination]);

  // Ensure hooks run before any conditional early returns
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Find Local Guides</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          {!initialDestination ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter destination (e.g., Jaipur)"
                  className="pl-9 pr-3 py-3 border rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <button onClick={search} disabled={loading} className="px-4 py-3 bg-orange-600 text-white rounded-lg disabled:opacity-50">
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Showing available guides for <span className="font-semibold">{destination}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guides.map((g) => (
              <div key={g._id} className="border rounded-xl p-4">
                <div className="font-semibold text-gray-800 flex items-center justify-between">
                  <span>{g.user?.name || 'Guide'}</span>
                  {g.isAvailable ? <span className="text-xs text-green-600">Available</span> : <span className="text-xs text-gray-500">Unavailable</span>}
                </div>
                <div className="text-sm text-gray-600 mt-1">{g.bio || 'Local expert'}</div>
                {Array.isArray(g.services) && g.services.length > 0 && (
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="font-semibold">Services:</span> {g.services.map((s: any) => `${s.destination} (₹${s.pricePerTrip})`).join(', ')}
                  </div>
                )}
                <div className="flex gap-3 mt-3 text-sm">
                  {g.user?.email && (
                    <a href={`mailto:${g.user.email}`} className="inline-flex items-center gap-1 text-blue-600 hover:underline"><Mail className="w-4 h-4" /> Email</a>
                  )}
                  {g.user?.phone && (
                    <a href={`https://wa.me/${g.user.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-green-600 hover:underline"><Phone className="w-4 h-4" /> WhatsApp</a>
                  )}
                </div>
                <div className="mt-4">
                  <button onClick={() => onBook(g._id)} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"><Calendar className="w-4 h-4" /> Book Guide</button>
                </div>
              </div>
            ))}
          </div>
          {guides.length === 0 && !loading && (
            <div className="text-sm text-gray-500">No guides yet. Try another destination.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideInfo;


