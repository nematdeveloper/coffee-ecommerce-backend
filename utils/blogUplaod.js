const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage
const storage = multer.memoryStorage();

// File filter: only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, WEBP, GIF)"), false);
  }
};

// Multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// Accept fields: main blog image + multiple additional images
const uploadBlogImages = upload.fields([
  { name: "blogImage", maxCount: 1 },
  { name: "blogImages", maxCount: 5 },
]);

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File too large. Maximum size is 10MB' 
      });
    }
    return res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  } else if (err) {
    return res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
  next();
};

// Watermark SVG
const createWatermark = (text = "© Rayan Saffron") =>
  Buffer.from(`
    <svg width="300" height="50">
      <text x="50%" y="50%" text-anchor="middle" dy=".3em"
        font-family="Arial" font-size="20" fill="rgba(255,255,255,0.7)">
        ${text}
      </text>
    </svg>
  `);

// Process images: resize + watermark + upload to Cloudinary
const processBlogImages = async (req, res, next) => {
  try {
    // If no files uploaded, skip processing
    if (!req.files || (!req.files.blogImage && !req.files.blogImages)) {
      req.uploadedFiles = {};
      return next();
    }

    // Prepare container
    req.uploadedFiles = {};

    // Handle main image
    if (req.files.blogImage && req.files.blogImage[0]) {
      const file = req.files.blogImage[0];
      const optimizedBuffer = await sharp(file.buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .composite([{ input: createWatermark(), gravity: "southeast" }])
        .jpeg({ quality: 85 })
        .toBuffer();

      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "rayan-saffron/blog", resource_type: "image" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(optimizedBuffer);
      });

      req.uploadedFiles.blogImage = uploaded.secure_url;
    }

    // Handle additional images
    if (req.files.blogImages) {
      req.uploadedFiles.blogImages = [];
      
      for (let i = 0; i < req.files.blogImages.length; i++) {
        const file = req.files.blogImages[i];
        const optimizedBuffer = await sharp(file.buffer)
          .resize({ width: 1200, withoutEnlargement: true })
          .composite([{ input: createWatermark(), gravity: "southeast" }])
          .jpeg({ quality: 85 })
          .toBuffer();

        const uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "rayan-saffron/blog/additional", resource_type: "image" },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          stream.end(optimizedBuffer);
        });

        req.uploadedFiles.blogImages.push({ url: uploaded.secure_url });
      }
    }

    next();
  } catch (err) {
    console.error("Blog image processing error:", err);
    next(err); // Pass error to error handling middleware
  }
};

module.exports = { 
  uploadBlogImages, 
  processBlogImages, 
  handleMulterError 
};