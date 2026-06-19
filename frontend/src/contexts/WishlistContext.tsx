import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { Destination, WishlistItem } from '../types';
import { useAuth } from './AuthContext';

// Define the URL for our new wishlist API
const API_URL = '/api/wishlist';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (destination: Destination) => Promise<boolean>;
  removeFromWishlist: (destinationId: string) => Promise<void>;
  isInWishlist: (destinationId: string) => boolean;
}

interface WishlistProviderProps {
  children: ReactNode;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children, showNotification }: WishlistProviderProps) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const { user, token } = useAuth(); // We need the token for authenticated requests

  // This effect runs when the user logs in or out
  useEffect(() => {
    const fetchWishlist = async () => {
      if (user && token) {
        try {
          // Create headers with the auth token to send to the backend
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          // Fetch the user's wishlist from the database
          const response = await axios.get(API_URL, config);
          setWishlistItems(response.data);
        } catch (error) {
          console.error('Failed to fetch wishlist:', error);
          showNotification('Could not load your wishlist.', 'error');
        }
      } else {
        // If the user logs out, clear the wishlist
        setWishlistItems([]);
      }
    };

    fetchWishlist();
  }, [user, token, showNotification]);

  const addToWishlist = async (destination: Destination): Promise<boolean> => {
    if (!user || !token) {
      showNotification('Please sign in to add to your wishlist', 'error');
      return false;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Send the new destination to the backend to be saved in the database
      const response = await axios.post(API_URL, { destination }, config);
      
      // Add the new item (returned from the server) to our local state
      setWishlistItems(prevItems => [...prevItems, response.data]);
      // Updated: standardized success message
      showNotification('✅ Destination added to wishlist.', 'success');
      return true;
    } catch (error: any) {
      console.error('Failed to add to wishlist:', error);
      // Updated: show precise error for duplicate or general failure
      if (error?.response?.status === 400) {
        showNotification('⚠ Unable to add destination.', 'error');
      } else {
        showNotification('⚠ Unable to add destination.', 'error');
      }
      return false;
    }
  };

  const removeFromWishlist = async (destinationId: string) => {
    if (!token) return;

    // Find the specific wishlist item to get its database ID (_id)
    const itemToRemove = wishlistItems.find(item => item.destination.id === destinationId);
    if (!itemToRemove) return; // Item not in wishlist, silently skip

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Tell the backend to delete the item with this specific database ID
      await axios.delete(`${API_URL}/${itemToRemove._id}`, config);

      // Remove the item from our local state to update the UI instantly
      setWishlistItems(prevItems => prevItems.filter(item => item.destination.id !== destinationId));
      // Updated: Show correct message when trip is planned/saved
      showNotification('✅ Trip removed from wishlist successfully.', 'success');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      // Updated: Show correct failure message
      showNotification('⚠ Could not remove the trip from wishlist.', 'error');
    }
  };

  const isInWishlist = (destinationId: string): boolean => {
    return wishlistItems.some(item => item.destination.id === destinationId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
