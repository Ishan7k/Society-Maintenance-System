const express = require("express");
const router = express.Router();
const { generateBills, generateSingleBill, getBills, getBillById } = require("../controllers/billController");
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");

router.post("/generate", protect, roleCheck("admin"), generateBills);
router.post("/generate-single", protect, roleCheck("admin"), generateSingleBill);
router.get("/", protect, getBills);
router.get("/:id", protect, getBillById);

module.exports = router;
