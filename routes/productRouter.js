const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { uploadProductImages } = require('../utils/upload');
const { auth, admin } = require('../Middleware/authMiddleware');

// CRUD routes
router.get('/', productController.getProducts);
router.post('/', uploadProductImages, productController.createProduct);
router.put('/:id', uploadProductImages, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.get("/:id", productController.getProductById);

// Error handling middleware for this router
router.use((err, req, res, next) => {
  console.error('Product router error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

module.exports = router;