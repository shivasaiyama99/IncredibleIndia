const User = require('../models/user'); // Corrected from 'User' to 'user'
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Signup Logic ---
exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      console.error('SIGNUP ERROR: Missing required fields (name, email, or password)');
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`SIGNUP REJECTED: User with email ${email} already exists.`);
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const normalizedRole = role === 'guide' ? 'guide' : 'tourist';
    const newUser = new User({ name, email, password: hashedPassword, phone, role: normalizedRole });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log(`SUCCESS: User ${email} created successfully.`);

    res.status(201).json({
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    console.error('SIGNUP ERROR:', error); 
    res.status(500).json({ message: 'Server error during signup.' });
  }
};

// --- Login Logic ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`LOGIN FAILED: No user found with email ${email}.`);
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`LOGIN FAILED: Incorrect password for user ${email}.`);
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    console.log(`SUCCESS: User ${email} logged in successfully.`);

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

