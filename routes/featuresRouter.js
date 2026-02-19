const express = require("express")
const router = express.Router()
const featureController = require("../controllers/featureController")

router.post("/sendemail",featureController.sendEmail)


module.exports = router