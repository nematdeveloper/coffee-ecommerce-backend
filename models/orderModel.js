const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  username: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  shippingMethod: { type: String, required: true },
  qunatity: { type: Number, required: true },
  unit: { type: String, required: true },
  purchasedProducts: [
    {
      productname: { type: String, required: true },
      type: { type: String, required: true },
  
    }
  ],
  isCancelled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
