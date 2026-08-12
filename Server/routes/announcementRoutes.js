const express = require("express");
const router = express.Router();
const { createAnnouncement, getAnnouncements } = require("../controllers/announcementController");
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");

router.post("/", protect, roleCheck("admin"), createAnnouncement);
router.get("/", protect, getAnnouncements);

module.exports = router;
