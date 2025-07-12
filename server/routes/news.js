const express = require('express');
const router = express.Router();
const News = require('../models/News');
const auth = require('../middleware/auth');

// Get all news
router.get('/', async (req, res) => {
  try {
    const news = await News.find().sort('-createdAt');
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied' });
  
  try {
    const news = new News(req.body);
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// server/routes/newsRoutes.js
router.post('/verify-news', upload.single('file'), async (req, res) => {
  try {
    // Get text from form-data
    const text = req.body.text;
    // If file is uploaded, you can access it via req.file

    // TODO: Add your verification logic here (ML model, DB, etc.)
    // For demo, return a random percent and verdict
    const percent = Math.floor(Math.random() * 101);
    const verdict = percent > 60 ? "Fake" : "Real";

    // Optionally, save to DB here

    res.json({ percent, verdict });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});