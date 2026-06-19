import React from 'react';
import { X, Save, Edit, Calendar, Users, Wallet } from 'lucide-react';
import { TripPlan } from '../types';

interface ItineraryPreviewProps {
  isOpen: boolean;
  tripPlan: TripPlan | null;
  onClose: () => void;
  onSave: (itineraryText: string) => void;
  onEdit: () => void;
  onBookNow?: () => void; // Optional: Not used in current implementation (Save Plan replaces Book Now)
}

const ItineraryPreview: React.FC<ItineraryPreviewProps> = ({
  isOpen,
  tripPlan,
  onClose,
  onSave,
  onEdit
  // onBookNow is optional and not used in current implementation
}) => {
  if (!isOpen || !tripPlan) return null;

  // Generate itinerary based on date range and selected destinations with varied content
  const generateItineraryText = (): string => {
    const firstDestination = tripPlan.destination || 'your chosen destination';
    const start = tripPlan.startDate ? new Date(tripPlan.startDate) : null;
    const end = tripPlan.endDate ? new Date(tripPlan.endDate) : null;
    if (!start || !end) {
      return `<p>Please provide trip dates.</p>`;
    }
    const startMid = new Date(start); startMid.setHours(0,0,0,0);
    const endMid = new Date(end); endMid.setHours(0,0,0,0);
    const totalDays = Math.ceil((endMid.getTime() - startMid.getTime()) / (24*60*60*1000)) + 1; // inclusive
    if (totalDays <= 1) {
      return `<h3 class="text-lg font-semibold mb-2">Day 1: Arrival and Exploration</h3><p>Arrive at ${firstDestination}. Explore nearby attractions.</p>`;
    }

    // Day 1: Arrival, Last day: Departure
    const middleDays = Math.max(0, totalDays - 2);
    const selected = tripPlan.selectedDestinations || [];
    const selections = selected.length > 0 ? selected : [];

    // Variation pools per destination
    const activityIdeas: Record<string, string[]> = {};
    selections.forEach(d => {
      activityIdeas[d.id] = [
        `Explore local markets and taste regional cuisine in ${d.name}.`,
        `Visit a landmark near ${d.name} and capture scenic views.`,
        `Enjoy a guided walking tour around ${d.name}.`,
        `Relax at a popular cafe district in ${d.name}.`,
        `Discover hidden gems and cultural spots in ${d.name}.`,
      ];
    });

    // Distribute with support for bundling and repeats
    const days: { title: string; body: string }[] = [];
    days.push({
      title: 'Day 1: Arrival and Exploration',
      body: `Arrive at ${firstDestination}. Check into your accommodation and enjoy a relaxing exploration of the local area.`
    });
    if (middleDays > 0) {
      if (selections.length === 0) {
        for (let i = 0; i < middleDays; i++) {
          days.push({
            title: `Day ${i + 2}: Leisure and Local Exploration`,
            body: 'Flexible day for leisure, local walks, and optional activities.'
          });
        }
      } else if (middleDays < selections.length) {
        // Fewer days than destinations: multi-destination days
        const perDay = Math.ceil(selections.length / middleDays);
        for (let i = 0; i < middleDays; i++) {
          const chunk = selections.slice(i * perDay, (i + 1) * perDay);
          const titleNames = chunk.map(d => d.name).join(' & ');
          const bodyParts = chunk.map((d, idx) => {
            const ideas = activityIdeas[d.id];
            const idea = ideas[(i + idx) % ideas.length];
            return idea;
          });
          days.push({
            title: `Day ${i + 2}: ${titleNames}`,
            body: bodyParts.join(' ')
          });
        }
      } else {
        // Enough or more days: repeat destinations with varied content
        for (let i = 0; i < middleDays; i++) {
          const d = selections[i % selections.length];
          const ideas = activityIdeas[d.id];
          const idea = ideas[i % ideas.length];
          days.push({
            title: `Day ${i + 2}: ${d.name}`,
            body: idea
          });
        }
      }
    }

    days.push({
      title: `Day ${totalDays}: Departure`,
      body: 'Enjoy a final breakfast, check out, and depart for your next destination.'
    });

    return days
      .map(d => `
      <h3 class="text-lg font-semibold mb-2">${d.title}</h3>
      <p class="mb-4">${d.body}</p>
    `)
      .join('');
  };

  // Updated: Close immediately when Save Plan is clicked (no alert needed, checkmark animation provides feedback)
  const handleSaveClick = () => {
    onClose(); // Close trip plan box immediately
    const itineraryText = generateItineraryText();
    onSave(itineraryText); // Save in background
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Your Custom Itinerary</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Trip Summary */}
        <div className="p-6 overflow-y-auto">
          <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b">
            <div className="flex items-center text-gray-700">
              <Calendar className="w-5 h-5 mr-2 text-orange-500" />
              <span>Destination: <strong>{tripPlan.destination}</strong></span>
            </div>
            <div className="flex items-center text-gray-700">
              <Users className="w-5 h-5 mr-2 text-orange-500" />
              <span><strong>{tripPlan.numberOfPeople}</strong> Travelers</span>
            </div>
            {tripPlan.budget && (
              <div className="flex items-center text-gray-700">
                <Wallet className="w-5 h-5 mr-2 text-orange-500" />
                <span className="capitalize">Budget: <strong>{tripPlan.budget}</strong></span>
              </div>
            )}
            {tripPlan.safetyMonitoring && (
              <div className="text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                Safety Monitoring On{tripPlan.trustedContactEmail ? ` → ${tripPlan.trustedContactEmail}` : ''}
              </div>
            )}
          </div>

          {/* Itinerary Content */}
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: generateItineraryText() }}
          />
        </div>

        {/* Footer Buttons */}
        <div className="p-6 mt-auto border-t bg-gray-50 rounded-b-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Updated: Close immediately when Edit Plan is clicked */}
            <button
              onClick={() => { onClose(); onEdit(); }}
              className="flex items-center justify-center w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Trip
            </button>
            {/* Updated: Changed to call handleSaveClick for immediate close behavior */}
            <button
              onClick={handleSaveClick}
              className="flex items-center justify-center w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-all"
            >
              <Save className="w-5 h-5 mr-2" />
              Save my Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPreview;
