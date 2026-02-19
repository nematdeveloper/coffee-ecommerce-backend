// utils/localizeBlog.js

// Helper to pick language with fallback
const t = (obj, lang = 'en', fallback = '') => obj?.[lang] ?? obj?.en ?? fallback;

// Localize a single blog
const localizeBlog = (blog, lang = 'en') => ({
  _id: blog._id,
  blogTitle: t(blog.blogTitle, lang),
  blogInfo: t(blog.blogInfo, lang),
  blogImage: blog.blogImage,
  blogImages: blog.blogImages?.map(img => ({
    url: img.url,
    alt: t(img.alt, lang)
  })) || [],
  createdAt: blog.createdAt,
  updatedAt: blog.updatedAt
});

// Localize an array of blogs
const localizeBlogs = (blogs, lang = 'en') => blogs.map(blog => localizeBlog(blog, lang));

module.exports = { localizeBlog, localizeBlogs };
