const express = require("express");
const router = express.Router();
const { createFlat, getFlats, updateFlat } = require("../controllers/flatController");
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");

router.get("/", protect, getFlats); // filtered by role inside controller
router.post("/", protect, roleCheck("admin"), createFlat);
router.put("/:id", protect, roleCheck("admin"), updateFlat);

module.exports = router;
