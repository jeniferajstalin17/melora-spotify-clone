const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Song = require('../models/Song');
const auth = require('../middleware/auth');

// Get a user's public profile + their songs
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username followers following');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const songs = await Song.find({ uploadedBy: req.params.id }).sort({ createdAt: -1 });

    res.json({
      id: user._id,
      username: user.username,
      followersCount: user.following ? user.following.length : 0,
      songs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Follow a user
router.put('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }
    const currentUser = await User.findById(req.user.id);
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'Already following' });
    }
    currentUser.following.push(req.params.id);
    await currentUser.save();
    res.json({ message: 'Followed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unfollow a user
router.put('/:id/unfollow', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== req.params.id
    );
    await currentUser.save();
    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get list of users the current user is following (with details)
router.get('/me/following', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).populate('following', 'username');
    res.json(currentUser.following);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;