import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { X, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface BookGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  guideId: string | null;
  onBooked?: () => void;
}

const BookGuideModal: React.FC<BookGuideModalProps> = ({ isOpen, onClose, guideId, onBooked }) => {
  const { token } = useAuth();
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const base = '';

  if (!isOpen || !guideId) return null;

  const submit = async () => {
    if (!date) return;
    setLoading(true);
    try {
      await axios.post(`${base}/api/guide/bookings`, { guideId, date, notes }, { headers: { Authorization: `Bearer ${token}` } });
      if (onBooked) onBooked();
      onClose();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
          <X className="w-6 h-6 text-gray-600" />
        </button>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-orange-600" /> Book Guide</h3>

        <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4" />

        <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4" rows={3} />

        <button onClick={submit} disabled={loading || !date} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50">
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
};

export default BookGuideModal;


