import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

type Trip = any;

const MyTrips: React.FC = () => {
  const { token } = useAuth();
  const [planned, setPlanned] = useState<Trip[]>([]);
  const [booked, setBooked] = useState<Trip[]>([]);
  const backendBaseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || '', []);

  useEffect(() => {
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    Promise.all([
      axios.get(`${backendBaseUrl}/api/tripplans?status=planned`, config),
      axios.get(`${backendBaseUrl}/api/bookings`, config),
    ])
      .then(([p, b]) => {
        setPlanned(p.data.tripPlans || []);
        setBooked(b.data.bookings || []);
      })
      .catch(() => {});
  }, [token, backendBaseUrl]);

  if (!token) return null;

  return (
    <section className="container mx-auto px-4 my-8">
      <h3 className="text-xl font-semibold mb-4">My Plans</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {planned.map((t: any) => (
          <div key={t._id} className="border rounded-lg p-4">
            <div className="font-semibold">{t.destination}</div>
            <div className="text-sm text-gray-600">Travelers: {t.numberOfPeople}</div>
            {t.startDate && <div className="text-xs">Start: {new Date(t.startDate).toLocaleDateString()}</div>}
            {t.endDate && <div className="text-xs">End: {new Date(t.endDate).toLocaleDateString()}</div>}
            {t.safetyMonitoring && <div className="text-xs text-blue-700">Safety monitoring enabled</div>}
          </div>
        ))}
        {planned.length === 0 && <div className="text-sm text-gray-500">No planned trips</div>}
      </div>

      <h3 className="text-xl font-semibold mb-4">My Bookings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {booked.map((t: any) => (
          <div key={t._id} className="border rounded-lg p-4">
            <div className="font-semibold">{t.destination}</div>
            <div className="text-sm text-gray-600">Travelers: {t.numberOfPeople}</div>
            <div className="text-xs">Status: {t.status}</div>
            {t.startDate && <div className="text-xs">Start: {new Date(t.startDate).toLocaleDateString()}</div>}
            {t.endDate && <div className="text-xs">End: {new Date(t.endDate).toLocaleDateString()}</div>}
          </div>
        ))}
        {booked.length === 0 && <div className="text-sm text-gray-500">No bookings</div>}
      </div>
    </section>
  );
};

export default MyTrips;


