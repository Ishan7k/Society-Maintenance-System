const express = require("express");
const router = express.Router();
const { getAdminDashboard, getResidentDashboard } = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");

router.get("/admin", protect, roleCheck("admin"), getAdminDashboard);
router.get("/resident", protect, roleCheck("resident"), getResidentDashboard);

module.exports = router;
