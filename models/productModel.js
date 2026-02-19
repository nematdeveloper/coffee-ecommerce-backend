const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  // Product Basic Info (Multilingual)
  productname: {
    en: { type: String, required: true },
    fa: { type: String, required: true },
    ar: { type: String }
  },
  
  // Amount/Quantity (in grams)
  productamount: {
    type: Number,
    default: 1
  },
  
  // Pricing (in your currency)
  productPrice: {
    type: Number,
    
  },
  
  // Discount Price (optional)
  discountPrice: {
    type: Number
    
  },
  
  // Stock Quantity
  stock: {
    type: Number,
    default: 0
  },
  
  // Product Description (Multilingual)
  productDescription: {
    en: { type: String },
    fa: { type: String },
    ar: { type: String }
  },
  
  // Main Product Image (URL)
  productImage: {
    type: String,
    required: true
  },
  
 
  
  // Product Details Images (Array of URLs)
  productDetailsImages: [{
    url: { type: String, required: true },
    alt: {
      en: { type: String },
      fa: { type: String },
      ar: { type: String }
    }
  }],
  
  
  type: {
    en: { type: String }, // e.g., "Sargol", "Pushal", "Negin"
    fa: { type: String }, // e.g., "سرگل", "پوشال", "نگین"
    ar: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Product = mongoose.model("Product", productSchema);
module.exports = Product;