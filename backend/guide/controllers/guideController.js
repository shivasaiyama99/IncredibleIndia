const Guide = require('../models/guide');
const User = require('../../src/models/user');

exports.createGuideProfile = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'guide') return res.status(403).json({ message: 'Only guides can create profiles' });
    const exists = await Guide.findOne({ user: req.user.id });
    if (exists) return res.status(400).json({ message: 'Guide profile already exists' });

    const { bio = '', services = [], languages = [], location = '' } = req.body || {};
    const guide = await Guide.create({ user: req.user.id, bio, services, languages, location });
    res.status(201).json({ guide });
  } catch (e) {
    console.error('Create guide error', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getGuidesByDestination = async (req, res) => {
  try {
    const { destination } = req.params;
    const regex = new RegExp(destination, 'i');
    const guides = await Guide.find({ 'services.destination': regex, isAvailable: true })
      .populate({ path: 'user', select: 'name email phone role' })
      .lean();
    res.json({ guides });
  } catch (e) {
    console.error('Search guides error', e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const guide = await Guide.findOneAndUpdate({ user: id }, req.body, { new: true });
    if (!guide) return res.status(404).json({ message: 'Guide profile not found' });
    res.json({ guide });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const { id } = req.user;
    const guide = await Guide.findOne({ user: id });
    if (!guide) return res.status(404).json({ message: 'Guide profile not found' });
    guide.isAvailable = !guide.isAvailable;
    await guide.save();
    res.json({ guide });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};


