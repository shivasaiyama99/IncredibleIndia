import { Hotel } from '../types';

export const hotels: Hotel[] = [
  {
    id: '1',
    name: 'Taj Lake Palace',
    location: 'Udaipur, Rajasthan',
    rating: 5,
    price: '₹45,000/night',
    image: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
    amenities: ['Luxury Spa', 'Fine Dining', 'Lake Views', 'Heritage Experience'],
    description: 'A floating palace on Lake Pichola, offering unmatched luxury and heritage experience.'
  },
  {
    id: '2',
    name: 'Houseboat Kerala',
    location: 'Alleppey, Kerala',
    rating: 4,
    price: '₹8,000/night',
    image: 'https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg',
    amenities: ['Traditional Cuisine', 'Scenic Views', 'Cultural Experience', 'Private Deck'],
    description: 'Experience the backwaters of Kerala in a traditional houseboat with modern amenities.'
  },
  {
    id: '3',
    name: 'Beach Resort Goa',
    location: 'Goa',
    rating: 4,
    price: '₹12,000/night',
    image: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg',
    amenities: ['Beach Access', 'Water Sports', 'Spa Services', 'Multiple Restaurants'],
    description: 'Luxury beach resort offering stunning ocean views and world-class amenities.'
  }
];