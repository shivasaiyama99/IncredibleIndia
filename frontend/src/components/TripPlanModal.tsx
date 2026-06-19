import React, { useState, useEffect } from 'react';
import {
  X, MapPin, Users, DollarSign, Shield,
  Mountain, Heart, Leaf, Utensils, Sparkles
} from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { Destination } from '../types';

interface TripPlanFormData {
  destination: string;
  // duration removed; dates drive duration now
  budget: string;
  tripType: 'cultural' | 'adventure' | 'spiritual' | 'nature' | 'food';
  safetyMonitoring: boolean;
  trustedContactEmail?: string;
  safetyFrequencyMinutes?: number;
  numberOfPeople: number;
  startDate?: string; // ISO date or datetime-local string
  endDate?: string;   // ISO date or datetime-local string
  startTime?: string; // HH:MM
  endTime?: string;   // HH:MM
  selectedDestinations: Destination[];
}

interface TripPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tripPlan: TripPlanFormData) => void;
  initialData?: TripPlanFormData; // ✅ new optional prop
  onFindGuides?: (destinationName: string) => void;
}

const TripPlanModal: React.FC<TripPlanModalProps> = ({ isOpen, onClose, onSubmit, initialData, onFindGuides }) => {
  const initialFormData: TripPlanFormData = {
    destination: '',
    budget: '',
    tripType: 'cultural',
    safetyMonitoring: false,
    trustedContactEmail: '',
    // Default left undefined; consumer will fall back to 3 minutes if not provided
    safetyFrequencyMinutes: undefined,
    numberOfPeople: 2,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    selectedDestinations: [],
  };

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<TripPlanFormData>(initialFormData);
  const { wishlistItems } = useWishlist();

  // ✅ Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (initialData) {
        setFormData(initialData); // pre-fill with existing data
      } else {
        setFormData(initialFormData); // fresh plan
      }
    }
  }, [isOpen, initialData]);

  // Seed selected destinations from wishlist by default when opening (and no initial selection provided)
  useEffect(() => {
    if (!isOpen) return;
    if (initialData?.selectedDestinations && initialData.selectedDestinations.length > 0) return;
    if (wishlistItems.length === 0) return;
    if (formData.selectedDestinations.length > 0) return;
    const allFromWishlist = wishlistItems.map(w => w.destination);
    setFormData(prev => ({ ...prev, selectedDestinations: allFromWishlist }));
  }, [isOpen, wishlistItems, initialData, formData.selectedDestinations.length]);

  // Helpers for wishlist selection
  const isSelected = (destinationId: string) =>
    formData.selectedDestinations.some(d => d.id === destinationId);

  const toggleSelect = (destination: Destination) => {
    const already = isSelected(destination.id);
    const nextSelected = already
      ? formData.selectedDestinations.filter(d => d.id !== destination.id)
      : [...formData.selectedDestinations, destination];
    setFormData({ ...formData, selectedDestinations: nextSelected });
  };

  const tripTypes = [
    { id: 'cultural', name: 'Cultural', icon: <Heart className="w-6 h-6" />, color: 'bg-purple-100 text-purple-700' },
    { id: 'adventure', name: 'Adventure', icon: <Mountain className="w-6 h-6" />, color: 'bg-red-100 text-red-700' },
    { id: 'spiritual', name: 'Spiritual', icon: <Sparkles className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-700' },
    { id: 'nature', name: 'Nature', icon: <Leaf className="w-6 h-6" />, color: 'bg-green-100 text-green-700' },
    { id: 'food', name: 'Food & Culinary', icon: <Utensils className="w-6 h-6" />, color: 'bg-orange-100 text-orange-700' }
  ];

  if (!isOpen) return null;

  // Validate duration (must be at least 3 days inclusive)
  const isDurationValid = (): boolean => {
    const startDateString = formData.startDate;
    const endDateString = formData.endDate;
    if (!startDateString || !endDateString) return false;
    const s = new Date(startDateString + (formData.startTime ? `T${formData.startTime}:00` : 'T00:00:00'));
    const e = new Date(endDateString + (formData.endTime ? `T${formData.endTime}:00` : 'T23:59:59'));
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return false;
    const sMid = new Date(s); sMid.setHours(0,0,0,0);
    const eMid = new Date(e); eMid.setHours(0,0,0,0);
    const diffDays = Math.ceil((eMid.getTime() - sMid.getTime()) / (24*60*60*1000));
    return diffDays >= 2; // inclusive days >=3 → diffDays >= 2
  };

  const handleNext = () => {
    if (step >= 3) return;
    // Prevent navigating to Step 3 when duration invalid
    if (step === 2) {
      if (!isDurationValid()) {
        alert('Trip must be at least 3 days (Arrival, 1+ day, Departure).');
        return; // stay on Step 2 until corrected
      }
    }
    setStep(step + 1);
  };
  const handlePrev = () => step > 1 && setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    // Prevent implicit form submits via Enter from closing or advancing unexpectedly
    e.preventDefault();
  };

  const handleCreate = () => {
    // Validate dates: start >= today; end >= start; end - start <= 21 days
    const today = new Date(); today.setHours(0,0,0,0);
    // Compose datetime from date + time
    const startDateString = formData.startDate;
    const endDateString = formData.endDate;
    if (!startDateString || !endDateString) { alert('Please select start and end dates.'); return; }
    const s = new Date(startDateString + (formData.startTime ? `T${formData.startTime}:00` : 'T00:00:00'));
    const eDate = new Date(endDateString + (formData.endTime ? `T${formData.endTime}:00` : 'T23:59:59'));
    if (!s || !eDate) { alert('Please select start and end dates.'); return; }
    if (!formData.selectedDestinations.length) { alert('Please select at least one destination from your wishlist.'); return; }
    const sMid = new Date(s); sMid.setHours(0,0,0,0);
    const eMid = new Date(eDate); eMid.setHours(0,0,0,0);
    if (sMid < today) { alert('Start date cannot be in the past.'); return; }
    if (eMid < sMid) { alert('End date must be on/after start date.'); return; }
    const diffDays = Math.ceil((eMid.getTime() - sMid.getTime()) / (24*60*60*1000)); // difference, not inclusive
    if (diffDays > 21) { alert('Trip cannot exceed 21 days.'); return; }
    // Enforce at least 3 calendar days inclusive => diffDays + 1 >= 3 => diffDays >= 2
    if (diffDays < 2) { alert('Trip must be at least 3 days (Arrival, 1+ day, Departure).'); return; }
    // Compute destination label for summary/storage
    const destinationLabel = formData.selectedDestinations.length === 1
      ? formData.selectedDestinations[0].name
      : 'Multi-city';
    onSubmit({
      ...formData,
      destination: destinationLabel,
      startDate: s.toISOString(),
      endDate: eDate.toISOString(),
    });
  };

  const handleInputChange = (field: keyof TripPlanFormData, value: string | number | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Plan Your Perfect Trip</h2>
              <p className="text-gray-600 mt-1">Step {step} of 3 - Let's create your dream journey</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    stepNum <= step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`flex-1 h-2 mx-2 rounded ${
                      stepNum < step ? 'bg-orange-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Destination</span>
              <span>Preferences</span>
              <span>Details</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                {/* Wishlist selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Select destinations from your wishlist
                  </label>
                  {formData.selectedDestinations.length === 0 ? (
                    <p className="text-gray-500">Your wishlist is empty. Add destinations to start planning.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formData.selectedDestinations.map((dest) => (
                        <div key={dest.id} className={`border rounded-lg overflow-hidden transition border-orange-500`}>
                          <div className="h-28 w-full bg-gray-100 overflow-hidden">
                            <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3 flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-800 text-sm">{dest.name}</h4>
                              <p className="text-xs text-gray-500">{dest.state}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleSelect(dest)}
                              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                              title="Remove from this trip"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Removing with the cross only excludes it from this trip. Your wishlist remains unchanged.</p>
                </div>
                {/* Trip Dates & Times */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.startDate || ''}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime || ''}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      max={formData.startDate ? new Date(new Date(formData.startDate).getTime() + 21*24*60*60*1000).toISOString().split('T')[0] : undefined}
                      value={formData.endDate || ''}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime || ''}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Travelers moved to Step 1 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Users className="w-4 h-4 inline mr-2" />
                    Number of travelers ({formData.numberOfPeople} people)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.numberOfPeople}
                    onChange={(e) => handleInputChange('numberOfPeople', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Solo</span>
                    <span>Group (10+)</span>
                  </div>
                </div>

                {/* Find Guides inline */}
                {formData.selectedDestinations.length > 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onFindGuides && onFindGuides(formData.selectedDestinations[0].name)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Find Guides for {formData.selectedDestinations[0].name}
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Trip Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    What type of experience are you looking for?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tripTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleInputChange('tripType', type.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.tripType === type.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${type.color}`}>
                            {type.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{type.name}</h4>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Budget per person (Optional)
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select budget range</option>
                    <option value="budget">Budget (₹5,000 - ₹15,000)</option>
                    <option value="mid-range">Mid-range (₹15,000 - ₹35,000)</option>
                    <option value="luxury">Luxury (₹35,000+)</option>
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                {/* Safety Monitoring */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-1" />
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.safetyMonitoring}
                        onChange={(e) => handleInputChange('safetyMonitoring', e.target.checked)}
                        className="mr-3 w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="font-semibold text-blue-800">Enable Safety Monitoring</span>
                    </label>
                  </div>
                  {formData.safetyMonitoring && (
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Trusted contact email (alerts will be sent here)
                      </label>
                      <input
                        type="email"
                        value={formData.trustedContactEmail || ''}
                        onChange={(e) => handleInputChange('trustedContactEmail', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="name@example.com"
                        required
                      />
                      {/* Added: Safety check frequency input (in minutes) */}
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Safety check frequency (in minutes)
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={formData.safetyFrequencyMinutes ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const parsed = val === '' ? undefined : Math.max(1, parseInt(val));
                            handleInputChange('safetyFrequencyMinutes', parsed as any);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Default: 3"
                        />
                        <p className="text-xs text-gray-600 mt-1">If left empty, checks occur every 3 minutes.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrev}
                disabled={step === 1}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={step === 1 && (!formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime || formData.selectedDestinations.length === 0)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Create My Trip
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TripPlanModal;
