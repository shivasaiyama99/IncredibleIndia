import { ReactNode } from 'react';
export interface CulturalDestination {
  id: string;   // 👈 change number → string
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
