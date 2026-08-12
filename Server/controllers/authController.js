const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Flat = require("../models/Flat");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/register
// Admin creates a resident account and links it to a flat.
// (We also allow the very first admin to self-register when no admin exists yet — see seed.js instead for that; this route stays admin-protected.)
const register = async (req, res) => {
  try {
    const { name, email, password, phone, flatId, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role === "admin" ? "admin" : "resident",
      flatRef: role === "admin" ? null : flatId,
    });

    // link the flat back to this resident (works whether the flat is brand
    // new or an existing flat that had no resident linked yet)
    if (flatId) {
      const flat = await Flat.findById(flatId);
      if (flat && flat.residentRef) {
        return res.status(400).json({ message: "This flat already has a resident linked to it" });
      }
      await Flat.findByIdAndUpdate(flatId, { residentRef: user._id });
    }

    res.status(201).json({
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// POST /api/auth/profile-photo  (any logged-in user, uploads their own photo)
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image file received" });

    req.user.profileImage = req.file.path; // Cloudinary URL, set by multer-storage-cloudinary
    await req.user.save();

    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: "Failed to upload profile photo", error: err.message });
  }
};

module.exports = { register, login, getMe, uploadProfilePhoto };
