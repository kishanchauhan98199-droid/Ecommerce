const { authenticate, requireAdmin } = require("../middleware/auth");
const express  = require('express');
const multer   = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer — store in memory, then stream to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG and WebP images are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// POST /api/upload  (admin only)
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Wrap buffer upload in a promise
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:         'style-gallery-hub',
          transformation: [
            { width: 800, height: 1000, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
          ],
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    res.json({
      url:       result.secure_url,
      publicId:  result.public_id,
      width:     result.width,
      height:    result.height,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
});

// DELETE /api/upload/:publicId  (admin only)
router.delete('/:publicId', protect, admin, async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    await cloudinary.uploader.destroy(publicId);
    res.json({ message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;