const Blog = require('../models/blogModel');
const { localizeBlog, localizeBlogs } = require('../utils/localizeBlog');

// Get all blogs
const getBlogs = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const blogs = await Blog.find().lean();
    res.json({ success: true, blogs: localizeBlogs(blogs, lang) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get blog by ID
const getBlogById = async (req, res) => {
  const blogId = req.params.id;
  const lang = req.query.lang || 'en';

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    res.json({ success: true, blog: localizeBlog(blog, lang) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create new blog
const createBlog = async (req, res) => {
  try {
    let data = req.body;
    
    // Handle JSON data if sent as string in form-data
    if (req.body.data) {
      try {
        data = typeof req.body.data === 'string' 
          ? JSON.parse(req.body.data) 
          : req.body.data;
      } catch (parseErr) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid JSON data in form-data' 
        });
      }
    }

    // Use Cloudinary URLs from uploadedFiles
    if (req.uploadedFiles) {
      if (req.uploadedFiles.blogImage) {
        data.blogImage = req.uploadedFiles.blogImage;
      }
      if (req.uploadedFiles.blogImages) {
        data.blogImages = req.uploadedFiles.blogImages;
      }
    }

    const newBlog = new Blog(data);
    const saved = await newBlog.save();
    res.status(201).json({ success: true, blog: saved });
  } catch (err) {
    console.error('Create blog error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update blog (text only, images not handled)
const updateBlog = async (req, res) => {
  try {
    const id = req.params.id;
    let data = req.body;
    
    if (req.body.data) {
      try {
        data = typeof req.body.data === 'string' 
          ? JSON.parse(req.body.data) 
          : req.body.data;
      } catch (parseErr) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid JSON data in form-data' 
        });
      }
    }

    const updated = await Blog.findByIdAndUpdate(
      id,
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!updated) return res.status(404).json({ success: false, message: 'Blog not found' });

    res.json({ success: true, blog: updated });
  } catch (err) {
    console.error('Update blog error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete blog
const deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Blog not found' });

    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Delete blog error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog };