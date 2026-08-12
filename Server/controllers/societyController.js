const Society = require("../models/Society");

// GET /api/society  (public to all logged-in users — everyone should see the branding)
// Auto-creates the single society document on first access if it doesn't exist yet,
// so there's no separate "setup wizard" step needed.
const getSociety = async (req, res) => {
  try {
    let society = await Society.findOne();
    if (!society) {
      society = await Society.create({ name: "My Society" });
    }
    res.json(society);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch society info", error: err.message });
  }
};

// PUT /api/society  (admin only) — update name/address/contact
const updateSociety = async (req, res) => {
  try {
    let society = await Society.findOne();
    if (!society) society = new Society();

    const { name, address, contactEmail, contactPhone } = req.body;
    if (name) society.name = name;
    if (address !== undefined) society.address = address;
    if (contactEmail !== undefined) society.contactEmail = contactEmail;
    if (contactPhone !== undefined) society.contactPhone = contactPhone;

    await society.save();
    res.json(society);
  } catch (err) {
    res.status(500).json({ message: "Failed to update society info", error: err.message });
  }
};

// POST /api/society/logo  (admin only) — upload/replace society logo
// multer-storage-cloudinary already uploaded the file by the time this
// controller runs; req.file.path is the resulting Cloudinary URL.
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image file received" });

    let society = await Society.findOne();
    if (!society) society = new Society();

    society.logoUrl = req.file.path;
    await society.save();

    res.json(society);
  } catch (err) {
    res.status(500).json({ message: "Failed to upload logo", error: err.message });
  }
};

module.exports = { getSociety, updateSociety, uploadLogo };
