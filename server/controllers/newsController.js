const News = require('../models/News');

const axios = require('axios'); // Make sure axios is installed


exports.getAllNews = async (req, res, next) => {
  try {
    const newsItems = await News.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(newsItems);
  } catch (error) {
    console.error('Error in getAllNews:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.addNews = async (req, res, next) => {
  try {
    
    const { title, content, source, url } = req.body;

    if (!title || !content) {
         return res.status(400).json({ success: false, error: 'Title and Content are required' });
    }

    

    const newNews = await News.create({
        title,
        content,
        source,
        url,
        // isVerified: detectionResult.isFake === null ? null : !detectionResult.isFake, // Example logic
        // detectionConfidence: detectionResult.confidence
    });

    res.status(201).json(newNews);
  } catch (error) {
    console.error('Error in addNews:', error);
     if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, error: messages });
     }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Check news text for fakeness
// @route   POST /api/news/check
// @access  Public
exports.checkNews = async (req, res) => {
  console.log('checkNews called with body:', req.body);
  try {
    const { text } = req.body;
    console.log('Received text for verification:', text);
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide news text to check' });
    }
    console.log('Text is valid, proceeding with ML model check...');
    // Make a POST request to your Flask model
    const flaskUrl = 'http://127.0.0.1:5000/predict';
 // Make sure Flask server is running
    const flaskResponse = await axios.post(flaskUrl, { text });
    console.log('Flask response:', flaskResponse.data);
    console.log('Flask response status:', flaskResponse.status);
    // Example Flask response: [ { label: "LABEL_0", score: 0.9823 } ]
    const result = flaskResponse.data[0];
    const isFake = result.label === "LABEL_0"; // or "LABEL_1" if it's the opposite
    const confidence = Math.round(result.score * 100); // Convert 0.9823 to 98%

    res.status(200).json({
      success: true,
      isFake,
      confidence
    });

  } catch (error) {
    console.error('Error in checkNews:', error.message);

    if (error.response && error.response.data) {
      return res.status(500).json({ success: false, error: error.response.data.error || 'ML Model Error' });
    }

    res.status(500).json({ success: false, error: 'Server Error while checking news' });
  }
};
