// FILE: backend/src/middleware/auth.js
// PURPOSE: To act as a "security guard" for protected API routes.

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // 1. Get the token from the 'Authorization' header sent by the frontend.
  // It looks like: "Authorization: Bearer <the_token>"
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization denied. No token provided.' });
  }

  try {
    // 2. Split "Bearer <the_token>" to get just the token part.
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token format is invalid.' });
    }
    
    // 3. Verify the token is valid and hasn't expired using our secret key.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. If valid, attach the user's ID from the token to the request object.
    // This lets our next function know *who* is making the request.
    req.user = decoded;
    
    // 5. Allow the request to proceed to the actual route (e.g., getWishlist).
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

module.exports = authMiddleware;

