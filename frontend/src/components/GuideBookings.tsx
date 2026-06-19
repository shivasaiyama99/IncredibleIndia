import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

interface GuideBookingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuideBookings: React.FC<GuideBookingsProps> = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const base = '';

  useEffect(() => {
    if (!isOpen || !token) return;
    axios.get(`${base}/api/guide/bookings/guide`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setBookings(r.data.bookings || []))
      .catch(() => setBookings([]));
  }, [isOpen, token, base]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">My Guide Bookings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-600" /></button>
        </div>
        <div className="p-6 grid grid-cols-1 gap-4">
          {bookings.map(b => (
            <div key={b._id} className="border rounded-xl p-4">
              <div className="font-semibold text-gray-800">{b.user?.name || 'Traveler'}</div>
              <div className="text-sm text-gray-600">{b.user?.email}</div>
              <div className="text-sm text-gray-600">Date: {b.date ? new Date(b.date).toLocaleDateString() : '-'}</div>
              <div className="text-xs text-gray-500">Status: {b.status}</div>
              {b.notes && <div className="text-sm mt-2">Notes: {b.notes}</div>}
            </div>
          ))}
          {bookings.length === 0 && <div className="text-sm text-gray-500">No bookings yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default GuideBookings;


