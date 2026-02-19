const TelegramBot = require("node-telegram-bot-api");
const Order = require("../models/orderModel");

const bot = new TelegramBot(process.env.TOKEN, { polling: true });
const CHATID = process.env.CHATID;

exports.submitOrder = async (req, res) => {
  const { username, phone, address, shippingMethod, qunatity, unit, purchasedProducts } = req.body;

  if (!purchasedProducts || purchasedProducts.length === 0) {
    return res.status(400).json({ success: false, message: "No products provided" });
  }

  try {
    const orderCode = Math.floor(Math.random() * 100000000).toString();

    const newOrder = await Order.create({
      username,
      phone,
      address,
      shippingMethod,
      qunatity,
      unit,
      purchasedProducts,
      isCancelled: false
    });

    // Telegram message
    const productsText = purchasedProducts
      .map(p => `${p.productname} (${p.type})`)
      .join("\n");

    const message = `
📦 New order submitted!
Order Code: ${orderCode}
Name: ${username}
Phone: ${phone}
Address: ${address}
Shipping: ${shippingMethod}
Quantity: ${qunatity} ${unit}
Products:
${productsText}
`;

    await bot.sendMessage(CHATID, message);

    res.status(201).json({ success: true, orderCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const allOrders = await Order.find();
    res.status(200).json({ success: true, orders: allOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancel = async (req, res) => {
  const cancelledOrderId = req.params.id;

  try {
    const order = await Order.updateOne(
      { _id: cancelledOrderId },
      { $set: { isCancelled: true } }
    );

    if (order.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Order not found or already cancelled" });
    }

    res.status(200).json({ success: true, message: "Order cancelled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
