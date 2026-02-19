const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");


router.post("/order", orderController.submitOrder);


router.get("/orders", orderController.getOrders);
router.post("/orders/:id/cancel", orderController.cancel);
module.exports = router;
