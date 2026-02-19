const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const { uploadBlogImages, processBlogImages, handleMulterError } = require("../utils/blogUplaod");

// GET all blogs
router.get("/", blogController.getBlogs);

// GET blog by ID
router.get("/:id", blogController.getBlogById);

// POST create blog with image upload
router.post(
  "/",
  uploadBlogImages,
  handleMulterError, // Handle multer errors
  processBlogImages, // Process and upload to Cloudinary
  blogController.createBlog
);

// PUT update blog (currently text only)
router.put("/:id", blogController.updateBlog);

// DELETE blog
router.delete("/:id", blogController.deleteBlog);

module.exports = router;