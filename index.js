const express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors({ origin: '*' }));

// Auto-create uploads directory
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Static files (let Express handle MIME types)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

app.post('/api/images/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  const width = parseInt(req.query.width) || null;
  const height = parseInt(req.query.height) || null;

  const inputPath = path.join(__dirname, 'uploads', req.file.filename);
  const outputFilename = `compressed-${req.file.filename}`;
  const outputPath = path.join(__dirname, 'uploads', outputFilename);

  try {
    await sharp(inputPath)
      .resize(width, height)
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    res.json({
      path: `/uploads/${outputFilename}`,  // Leading slash for correct URL
      url: `http://localhost:5000/uploads/${outputFilename}`
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    res.status(500).send('Image compression failed');
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));