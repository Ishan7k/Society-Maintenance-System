const express = require("express");
const router = express.Router();
const { getSociety, updateSociety, uploadLogo } = require("../controllers/societyController");
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");
const upload = require("../middleware/upload");

router.get("/", protect, getSociety);
router.put("/", protect, roleCheck("admin"), updateSociety);
router.post("/logo", protect, roleCheck("admin"), upload.single("logo"), uploadLogo);

module.exports = router;
