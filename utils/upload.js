const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const os = require('os');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create watermark SVG for "Rayan Saffron"
const createRayanSaffronWatermark = () => {
  return Buffer.from(`
    <svg width="250" height="40">
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" rx="5" ry="5"/>
      <text x="50%" y="50%" 
            text-anchor="middle" 
            dy=".3em"
            font-family="Arial, Helvetica, sans-serif" 
            font-size="16" 
            font-weight="bold"
            fill="rgba(255,255,255,0.9)">
        © Rayan Saffron
      </text>
    </svg>
  `);
};

// Create custom storage engine with Sharp pre-processing
const createOptimizedStorage = () => {
  return {
    _handleFile: async function(req, file, cb) {
      const tempDir = os.tmpdir();
      const originalPath = path.join(tempDir, `original-${Date.now()}-${file.originalname}`);
      const optimizedPath = path.join(tempDir, `optimized-${Date.now()}-${file.originalname}`);
      
      try {
        // 1. Save original to temp file
        const writeStream = require('fs').createWriteStream(originalPath);
        file.stream.pipe(writeStream);
        
        writeStream.on('error', cb);
        writeStream.on('finish', async () => {
          try {
            // 2. Get image metadata
            const metadata = await sharp(originalPath).metadata();
            console.log(`Processing: ${file.originalname} | Size: ${metadata.width}x${metadata.height} | Format: ${metadata.format}`);
            
            // 3. Determine optimal dimensions based on image type
            let targetWidth, targetHeight;
            const isProductImage = file.fieldname === 'productImage';
            const isDetailImage = file.fieldname === 'productDetailsImages';
            
            if (isProductImage) {
              // Main product image: max 1200px
              targetWidth = Math.min(metadata.width, 1200);
            } else if (isDetailImage) {
              // Detail images: max 1000px
              targetWidth = Math.min(metadata.width, 1000);
            } else {
              // Other images: max 800px
              targetWidth = Math.min(metadata.width, 800);
            }
            
            // Maintain aspect ratio
            targetHeight = Math.round((targetWidth / metadata.width) * metadata.height);
            
            // 4. Create Sharp pipeline with watermark
            const sharpPipeline = sharp(originalPath)
              .resize(targetWidth, targetHeight, {
                fit: 'contain',
                withoutEnlargement: true,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
              });
            
            // 5. Apply format-specific optimization
            let optimizedBuffer;
            const watermark = createRayanSaffronWatermark();
            
            if (metadata.format === 'png' || metadata.format === 'gif') {
              optimizedBuffer = await sharpPipeline
                .png({ 
                  quality: 85,
                  compressionLevel: 9,
                  palette: true,
                  progressive: true
                })
                .composite([{
                  input: watermark,
                  gravity: 'southeast',
                  top: 10,
                  left: 10
                }])
                .toBuffer();
            } else if (metadata.format === 'webp') {
              optimizedBuffer = await sharpPipeline
                .webp({ 
                  quality: 82,
                  effort: 6,
                  alphaQuality: 80
                })
                .composite([{
                  input: watermark,
                  gravity: 'southeast',
                  top: 10,
                  left: 10
                }])
                .toBuffer();
            } else {
              // Default to JPEG (covers jpg, jpeg)
              optimizedBuffer = await sharpPipeline
                .jpeg({ 
                  quality: 85,
                  mozjpeg: true,
                  chromaSubsampling: '4:4:4',
                  progressive: true
                })
                .composite([{
                  input: watermark,
                  gravity: 'southeast',
                  top: 10,
                  left: 10
                }])
                .sharpen({ sigma: 0.5 }) // Slight sharpening for web
                .toBuffer();
            }
            
            // 6. Save optimized file
            await fs.writeFile(optimizedPath, optimizedBuffer);
            
            // 7. Calculate and log savings
            const originalStats = await fs.stat(originalPath);
            const optimizedStats = await fs.stat(optimizedPath);
            const savings = ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(1);
            
            console.log(`✅ ${file.originalname}: ${(originalStats.size/1024/1024).toFixed(2)}MB → ${(optimizedStats.size/1024).toFixed(2)}KB (${savings}% saved, ${targetWidth}x${targetHeight}px)`);
            
            // 8. Upload to Cloudinary with folder structure
            const folder = getCloudinaryFolder(file.fieldname);
            const publicId = `rayan-saffron-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            const uploadResult = await cloudinary.uploader.upload(optimizedPath, {
              folder: folder,
              public_id: publicId,
              resource_type: 'image',
              // Cloudinary-side optimizations (FREE - just ensures proper delivery)
              transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
              ],
              // Add tags for organization
              tags: ['rayan-saffron', file.fieldname, 'afghan-saffron']
            });
            
            // 9. Generate Cloudinary URLs with different sizes (cached versions)
            const urls = {
              original: uploadResult.secure_url,
              thumbnail: cloudinary.url(uploadResult.public_id, {
                transformation: [
                  { width: 400, crop: 'limit' },
                  { quality: 'auto:good' },
                  { fetch_format: 'auto' }
                ]
              }),
              medium: cloudinary.url(uploadResult.public_id, {
                transformation: [
                  { width: 800, crop: 'limit' },
                  { quality: 'auto:good' },
                  { fetch_format: 'auto' }
                ]
              }),
              large: cloudinary.url(uploadResult.public_id, {
                transformation: [
                  { width: 1200, crop: 'limit' },
                  { quality: 'auto:good' },
                  { fetch_format: 'auto' }
                ]
              })
            };
            
            // 10. Cleanup temp files
            await fs.unlink(originalPath).catch(() => {});
            await fs.unlink(optimizedPath).catch(() => {});
            
            // 11. Return file info
            cb(null, {
              fieldname: file.fieldname,
              originalname: file.originalname,
              encoding: file.encoding,
              mimetype: `image/${uploadResult.format || 'jpeg'}`,
              size: optimizedStats.size,
              destination: folder,
              filename: uploadResult.public_id,
              path: uploadResult.secure_url,
              cloudinary: {
                public_id: uploadResult.public_id,
                url: uploadResult.secure_url,
                urls: urls,
                format: uploadResult.format,
                bytes: uploadResult.bytes,
                width: uploadResult.width,
                height: uploadResult.height
              }
            });
            
          } catch (error) {
            await fs.unlink(originalPath).catch(() => {});
            await fs.unlink(optimizedPath).catch(() => {});
            console.error('Sharp/Cloudinary error:', error);
            cb(new Error(`Image processing failed: ${error.message}`));
          }
        });
        
      } catch (error) {
        console.error('File handling error:', error);
        cb(error);
      }
    },
    
    _removeFile: function(req, file, cb) {
      // Optional: Delete from Cloudinary if needed
      // cloudinary.uploader.destroy(file.cloudinary.public_id);
      cb(null);
    }
  };
};

// Get Cloudinary folder based on fieldname
const getCloudinaryFolder = (fieldname) => {
  const baseFolder = 'rayan-saffron/afghanistan';
  
  switch(fieldname) {
    case 'productImage':
      return `${baseFolder}/products/main`;
    case 'productDetailsImages':
      return `${baseFolder}/products/details`;
    case 'blogImages':
      return `${baseFolder}/blog`;
    case 'bannerImages':
      return `${baseFolder}/banners`;
    default:
      return `${baseFolder}/general`;
  }
};

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const allowedExtensions = /jpeg|jpg|png|webp|gif/i;
  
  const isMimeTypeValid = allowedTypes.includes(file.mimetype);
  const isExtensionValid = allowedExtensions.test(path.extname(file.originalname));
  
  if (isMimeTypeValid && isExtensionValid) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${allowedTypes.join(', ')} are allowed.`));
  }
};

// Create multer instance
const upload = multer({
  storage: createOptimizedStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max (Sharp will compress to ~100-800KB)
    files: 12 // 1 main + 10 details + 1 extra
  },
  fileFilter,
  preservePath: false
});

// Upload middleware for products
const uploadProductImages = (req, res, next) => {
  const uploadMiddleware = upload.fields([
    { name: 'productImage', maxCount: 1 },
    { name: 'productDetailsImages', maxCount: 10 }
  ]);
  
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'فایل خیلی بزرگ است. حداکثر سایز ۱۰ مگابایت'
        });
      }
      
      if (err.message.includes('Invalid file type')) {
        return res.status(400).json({
          success: false,
          message: 'فقط عکس مجاز است (jpg, png, webp, gif)'
        });
      }
      
      console.error('Upload error:', err);
      return res.status(500).json({
        success: false,
        message: 'آپلود عکس ناموفق بود',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    
    // Add processing stats to request
    if (req.files) {
      const allFiles = [
        ...(req.files.productImage || []),
        ...(req.files.productDetailsImages || [])
      ];
      
      req.imageProcessing = {
        totalFiles: allFiles.length,
        files: allFiles.map(file => ({
          name: file.originalname,
          finalSize: `${(file.size / 1024).toFixed(1)} KB`,
          dimensions: `${file.cloudinary.width}x${file.cloudinary.height}`,
          watermark: '© Rayan Saffron',
          urls: file.cloudinary.urls
        })),
        message: 'تمام عکس‌ها با واترمارک "رایان زعفران" آپلود شدند'
      };
      
      console.log('📊 Upload Summary:');
      req.imageProcessing.files.forEach(file => {
        console.log(`   ${file.name}: ${file.finalSize}, ${file.dimensions}`);
      });
    }
    
    next();
  });
};

// Upload middleware for blog images
const uploadBlogImages = (req, res, next) => {
  const uploadMiddleware = upload.fields([
    { name: 'blogImages', maxCount: 5 }
  ]);
  
  uploadMiddleware(req, res, (err) => {
    if (err) return handleUploadError(err, res);
    next();
  });
};

// Error handler
const handleUploadError = (err, res) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'فایل خیلی بزرگ است. حداکثر سایز ۱۰ مگابایت'
    });
  }
  
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: 'فقط عکس مجاز است'
    });
  }
  
  console.error('Upload error:', err);
  return res.status(500).json({
    success: false,
    message: 'آپلود ناموفق بود',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️ Deleted: ${publicId}`);
    return result;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

module.exports = {
  uploadProductImages,
  uploadBlogImages,
  deleteImage
};