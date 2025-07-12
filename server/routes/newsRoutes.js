const express = require('express');
const {
  getAllNews,
  addNews,
  checkNews
} = require('../controllers/newsController');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Configure multer for file uploads
router.route('/')
  .get(getAllNews)
  .post(addNews);

router.route('/check')
    .post(checkNews);

// Add routes for getting single news, updating, deleting if needed later
// router.route('/:id')
//   .get(getSingleNews)
//   .put(updateNews)
//   .delete(deleteNews);

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



module.exports = router;