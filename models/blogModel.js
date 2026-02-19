const mongoose = require("mongoose");

const blogSchema = mongoose.Schema({
  // Blog Title (Multilingual)
  blogTitle: {
    en: { type: String, required: true },
    fa: { type: String, required: true },
    ar: { type: String }
  },

  // Blog Info/Content (Multilingual)
  blogInfo: {
    en: { type: String, required: true },
    fa: { type: String, required: true },
    ar: { type: String }
  },

  // Main Blog Image (URL)
  blogImage: {
    type: String
  },

  // Additional Blog Images
  blogImages: [{
    url: { type: String,},
    alt: {
      en: { type: String },
      fa: { type: String },
      ar: { type: String }
    }
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
