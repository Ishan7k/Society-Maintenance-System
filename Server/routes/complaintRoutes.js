const express = require("express");
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
} = require("../controllers/complaintController");
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");

router.post("/", protect, createComplaint);
router.get("/", protect, getComplaints);
router.put("/:id", protect, roleCheck("admin"), updateComplaintStatus);

module.exports = router;
