import { ReactNode } from 'react';

// Defines the structure for a single destination
export interface Destination {
  id: string;
  name: string;
  state: string;
  description: string;
  image: string;
  category: 'heritage' | 'nature' | 'adventure' | 'spiritual';
  bestTime: string;
  duration: string;
  highlights: string[];
}

// Defines the structure for a user's trip plan
// This is now updated to match ALL fields from your TripPlanModal
export interface TripPlan {
  id: string;
  userId: string;
  destination: string; // Label (e.g., first destination or "Multi-city")
  selectedDestinations?: Destination[]; // Selected from wishlist for this plan
  budget: string;
  tripType: 'cultural' | 'adventure' | 'spiritual' | 'nature' | 'food';
  safetyMonitoring: boolean;
  trustedContactEmail?: string;
  // Added: user-set preferred safety check frequency (in minutes)
  safetyFrequencyMinutes?: number;
  numberOfPeople: number;
  itineraryText: string;
  createdAt: Date;
  status?: 'planned' | 'booked' | 'safe' | 'not_safe';
  startDate?: string | Date; // ISO with time
  endDate?: string | Date;   // ISO with time
  startTime?: string; // HH:MM
  endTime?: string;   // HH:MM
}

export interface Booking {
  _id: string;
  user: string;
  destination: string;
  destinations?: string[];
  numberOfPeople: number;
  budget: string;
  tripType: 'cultural' | 'adventure' | 'spiritual' | 'nature' | 'food';
  itineraryText: string;
  startDate: string | Date;
  endDate: string | Date;
  safetyMonitoring: boolean;
  trustedContactEmail?: string;
  // Added: persisted frequency on booking (in minutes). Defaults to 3 if undefined.
  safetyFrequencyMinutes?: number;
  lastSafetyCheck?: string | Date | null;
  status: 'booked' | 'safe' | 'not_safe';
  createdAt: string | Date;
}

// Defines the structure for an item in the user's wishlist from MongoDB
export interface WishlistItem {
  _id: string; // The ID from the MongoDB database
  destination: Destination;
  addedAt: Date;
  userId: string;
}

// Defines the structure for a cultural destination
export interface CulturalDestination {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  image: string;
  detailedDescription: string;
  history: string;
  highlights: string[];
  bestTime: string;
  duration: string;
  images: string[];
}

