const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const auth = require('../middleware/auth');

// Create a playlist
router.post('/', auth, async (req, res) => {
  try {
    const { name, isPublic } = req.body;
    const playlist = await Playlist.create({
      name,
      owner: req.user.id,
      isPublic: isPublic !== undefined ? isPublic : true,
    });
    res.status(201).json(playlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all playlists of logged-in user
router.get('/mine', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user.id }).populate('songs');
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single playlist by ID
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('songs');
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a song to a playlist
router.put('/:id/add-song', auth, async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }
    res.json(playlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove a song from a playlist
router.put('/:id/remove-song', auth, async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;