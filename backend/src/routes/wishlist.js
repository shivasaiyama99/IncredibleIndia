const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const auth = require('../middleware/auth');

// Apply the 'auth' middleware to all routes in this file.
// This ensures that only logged-in users can access these endpoints.
router.use(auth);

// @route   GET /api/wishlist
// @desc    Get all wishlist items for the logged-in user
router.get('/', getWishlist);

// @route   POST /api/wishlist
// @desc    Add a destination to the wishlist
router.post('/', addToWishlist);

// @route   DELETE /api/wishlist/:id
// @desc    Remove a destination from the wishlist by its database ID
router.delete('/:id', removeFromWishlist);

module.exports = router;
