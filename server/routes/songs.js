const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const Song = require('../models/Song');
const auth = require('../middleware/auth');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'spotify-clone/songs',
    resource_type: 'auto',
  },
});

const upload = multer({ storage });
router.post('/upload', auth, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]), async (req, res) => {
  try {
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    
    const { title, artist, genre } = req.body;
    const audioUrl = req.files['audio'][0].path;
    const coverUrl = req.files['cover'] ? req.files['cover'][0].path : '';

    const song = await Song.create({
      title,
      artist,
      genre,
      audioUrl,
      coverUrl,
      uploadedBy: req.user.id,
    });

    res.status(201).json(song);
  } catch (err) {
    console.log('ERROR:', err);
    res.status(400).json({ message: err.message });
  }
});
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const songs = await Song.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { artist: { $regex: q, $options: 'i' } },
      ],
    });
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Delete a song
router.delete('/:id', auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    if (song.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Song.findByIdAndDelete(req.params.id);
    res.json({ message: 'Song deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Like a song
router.put('/:id/like', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user.likedSongs.includes(req.params.id)) {
      user.likedSongs.push(req.params.id);
      await user.save();
    }
    res.json({ message: 'Song liked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unlike a song
router.put('/:id/unlike', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    user.likedSongs = user.likedSongs.filter((id) => id.toString() !== req.params.id);
    await user.save();
    res.json({ message: 'Song unliked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get liked songs
router.get('/user/liked', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).populate('likedSongs');
    res.json(user.likedSongs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;