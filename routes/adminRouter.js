const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");


router.get("/getall", adminController.getDashboardStats);



module.exports = router;
