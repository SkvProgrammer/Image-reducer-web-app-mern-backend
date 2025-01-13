const express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');  // For image compression
const app = express();
const cors = require('cors');
app.use(cors({ origin: '*' })); 



app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.set('Content-Type', 'image/jpeg');  // You can modify this based on file type (jpeg, png)
  }
}));


// Set up Multer storage and file filtering
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Handle Image Upload and Compression
app.post('/api/images/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const { width, height } = req.query;
  const inputPath = path.join(__dirname, 'uploads', req.file.filename);
  const outputPath = path.join(__dirname, 'uploads', `compressed-${req.file.filename}`);

  try {
    // Compress the image with the specified width and height
    await sharp(inputPath)
      .resize(parseInt(width), parseInt(height))
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    res.json({ path: `uploads/compressed-${req.file.filename}` });

  } catch (error) {
    console.error('Error compressing image:', error);
    res.status(500).send('Image compression failed');
  }
});


// Start server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
