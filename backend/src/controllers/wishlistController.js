const WishlistItem = require('../models/wishlist');

// --- Get all wishlist items for a user ---
exports.getWishlist = async (req, res) => {
  try {
    // req.user.id is attached by the auth middleware
    const wishlistItems = await WishlistItem.find({ user: req.user.id }).sort({ addedAt: -1 });
    res.status(200).json(wishlistItems);
  } catch (error) {
    console.error('GET WISHLIST ERROR:', error);
    res.status(500).json({ message: 'Server error while fetching wishlist.' });
  }
};

// --- Add an item to the wishlist ---
exports.addToWishlist = async (req, res) => {
  const { destination } = req.body;

  try {
    // Check if the item already exists for this user
    const existingItem = await WishlistItem.findOne({ 
      user: req.user.id, 
      'destination.id': destination.id 
    });

    if (existingItem) {
      return res.status(400).json({ message: 'This destination is already in your wishlist.' });
    }

    const newWishlistItem = new WishlistItem({
      user: req.user.id,
      destination: destination,
    });

    await newWishlistItem.save();
    console.log(`SUCCESS: Destination "${destination.name}" added to wishlist for user ${req.user.id}`);
    res.status(201).json(newWishlistItem);
  } catch (error) {
    console.error('ADD TO WISHLIST ERROR:', error);
    res.status(500).json({ message: 'Server error while adding to wishlist.' });
  }
};

// --- Remove an item from the wishlist ---
exports.removeFromWishlist = async (req, res) => {
  try {
    const item = await WishlistItem.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id  // Ensure users can only delete their own items
    });

    if (!item) {
      return res.status(404).json({ message: 'Wishlist item not found.' });
    }
    
    console.log(`SUCCESS: Destination removed from wishlist for user ${req.user.id}`);
    res.status(200).json({ message: 'Item removed from wishlist successfully.' });
  } catch (error) {
    console.error('REMOVE FROM WISHLIST ERROR:', error);
    res.status(500).json({ message: 'Server error while removing from wishlist.' });
  }
};
