const Product = require('../models/productModel');
const { localizeProduct, localizeProducts } = require('../utils/localizeProduct');


const getProducts = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
   
    
    

    const products = await Product.find().lean();
    res.json({ success: true, products: localizeProducts(products, lang) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getProductById = async (req, res) => {
  const productId = req.params.id;
  const lang = req.query.lang || "en";

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product: localizeProduct(product, lang) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);


    if (req.files['productImage']) {
      data.productImage = req.files['productImage'][0].path;
    }

    if (req.files['productDetailsImages']) {
      data.productDetailsImages = req.files['productDetailsImages'].map(file => ({
        url: file.path,
        alt: { en: '', fa: '', ar: '' }
    
      }));
    }

    console.log('FULL Cloudinary URL:', JSON.stringify(req.files['productImage'][0].path));
    const newProduct = new Product(data);
    const saved = await newProduct.save();
    res.status(201).json({ success: true, product: saved });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};


const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const data = JSON.parse(req.body.data || '{}');

  
    if (req.files['productImage']) {
      data.productImage = req.files['productImage'][0].path;
    }
    
    if (req.files['productDetailsImages']) {
      data.productDetailsImages = req.files['productDetailsImages'].map(file => ({
        url: file.path, 
        alt: { en: '', fa: '', ar: '' }
      }));
    }

    const updated = await Product.findByIdAndUpdate(
      id, 
      { ...data, updatedAt: Date.now() }, 
      { new: true }
    );
    
    if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: updated });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct, getProductById };