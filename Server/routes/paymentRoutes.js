const express = require("express");
const router = express.Router();
const { recordPayment, getPayments } = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

router.post("/", protect, recordPayment);
router.get("/", protect, getPayments);

module.exports = router;
