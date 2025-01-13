const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Endpoint to handle image upload and compression
router.post('/upload', upload.single('image'), async (req, res) => {
  const filePath = req.file.path;
  const outputFilePath = `uploads/compressed-${req.file.filename}`;

  // Get width and height from query parameters
  const { width, height } = req.query;

  try {
    // Compress and resize the image using Sharp
    await sharp(filePath)
      .resize(parseInt(width), parseInt(height)) // Resize to the specified width and height
      .jpeg({ quality: 60 }) // Compress with 60% quality
      .toFile(outputFilePath);

    // Remove the original file
    fs.unlinkSync(filePath);

    // Return the path of the compressed image
    res.json({ success: true, path: outputFilePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Image compression failed' });
  }
});


module.exports = router;
