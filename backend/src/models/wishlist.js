const mongoose = require('mongoose');

// The destination object will be stored directly in the wishlist item.
const destinationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  state: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  bestTime: { type: String, required: true },
  duration: { type: String, required: true },
  highlights: [String]
}, { _id: false }); // _id: false prevents Mongoose from creating a separate ID for the sub-document

const wishlistItemSchema = new mongoose.Schema({
  // This links the wishlist item to a user in the 'User' collection
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  destination: {
    type: destinationSchema,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index to ensure a user can't add the same destination twice
wishlistItemSchema.index({ user: 1, 'destination.id': 1 }, { unique: true });

const WishlistItem = mongoose.model('WishlistItem', wishlistItemSchema);

module.exports = WishlistItem;
