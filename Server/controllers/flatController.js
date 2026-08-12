const Flat = require("../models/Flat");

// POST /api/flats  (admin only)
const createFlat = async (req, res) => {
  try {
    const { unitNumber, block, ownerName, type, monthlyMaintenanceAmount } = req.body;
    const flat = await Flat.create({ unitNumber, block, ownerName, type, monthlyMaintenanceAmount });
    res.status(201).json(flat);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A flat with this unit number already exists" });
    }
    res.status(500).json({ message: "Failed to create flat", error: err.message });
  }
};

// GET /api/flats
// Admin sees all flats. Resident sees only their own flat.
// This filtering happens here, server-side — not left to the frontend.
const getFlats = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const flats = await Flat.find().populate("residentRef", "name email phone");
      return res.json(flats);
    }
    const flat = await Flat.findById(req.user.flatRef).populate("residentRef", "name email phone");
    res.json(flat ? [flat] : []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch flats", error: err.message });
  }
};

// PUT /api/flats/:id  (admin only)
const updateFlat = async (req, res) => {
  try {
    const flat = await Flat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!flat) return res.status(404).json({ message: "Flat not found" });
    res.json(flat);
  } catch (err) {
    res.status(500).json({ message: "Failed to update flat", error: err.message });
  }
};

module.exports = { createFlat, getFlats, updateFlat };
