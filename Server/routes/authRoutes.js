const express = require("express");
const router = express.Router();
const { register, login, getMe, uploadProfilePhoto } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { roleCheck } = require("../middleware/roleCheck");
const upload = require("../middleware/upload");

router.post("/login", login);
router.post("/register", protect, roleCheck("admin"), register); // only admin can create new users
router.get("/me", protect, getMe);
router.post("/profile-photo", protect, upload.single("photo"), uploadProfilePhoto);

module.exports = router;
