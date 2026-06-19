import React, { useState } from 'react';
import MyTrips from './MyTrips';

const TripsSection: React.FC = () => {
  const [tab, setTab] = useState<'plans' | 'bookings'>('plans');
  return (
    <section className="container mx-auto px-4 my-10">
      <div className="flex items-center mb-4">
        <button onClick={() => setTab('plans')} className={`px-4 py-2 rounded-l-lg border ${tab==='plans'?'bg-orange-500 text-white':'bg-white'}`}>My Plans</button>
        <button onClick={() => setTab('bookings')} className={`px-4 py-2 rounded-r-lg border -ml-px ${tab==='bookings'?'bg-orange-500 text-white':'bg-white'}`}>My Bookings</button>
      </div>
      <MyTrips />
    </section>
  );
};

export default TripsSection;


