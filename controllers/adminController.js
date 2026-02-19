const Product = require('../models/productModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Blog = require("../models/blogModel")
exports.getDashboardStats = async (req, res) => {
  try {
    const [productsCount, usersCount, ordersCount, blogCount] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Blog.countDocuments(),
    ]);

    res.json({ products: productsCount, users: usersCount, orders: ordersCount ,blog: blogCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


