const express = require('express');
const app = express();
require('dotenv').config();
const cors = require("cors");
const path = require('path');

// CORS configuration
app.use(cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⚠️ REMOVE this line - No more local uploads folder
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ OPTIONAL: Serve static frontend if you have one
// app.use(express.static(path.join(__dirname, 'public')));

// Port configuration
const port = process.env.PORT || 3000;

// Database connection
const Connection = require('./configs/DbConnection');

// Routes
const authRouter = require('./routes/authRouter');
const chatRoutes = require('./routes/chat');
const product = require("./routes/productRouter")
const orderRouter = require("./routes/orderRouter")
const admin = require("./routes/adminRouter")
const sendEmail = require("./routes/featuresRouter")
const blogRouter = require("./routes/blogRouter")
// Use routes
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRouter);
app.use("/api/products", product)
app.use("/api",orderRouter)
app.use("/api",admin)
app.use("/api/feature",sendEmail)
app.use("/api/blog",blogRouter)

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'missing'
  });
});

// ✅ Test Cloudinary endpoint (remove after testing)
app.get('/test-cloudinary', (req, res) => {
  const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    has_api_key: !!process.env.CLOUDINARY_API_KEY,
    has_api_secret: !!process.env.CLOUDINARY_API_SECRET
  };
  res.json({ cloudinary: cloudinaryConfig });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`🌩️ Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME || 'Not configured'}`);
});