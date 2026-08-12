const Announcement = require("../models/Announcement");

// POST /api/announcements  (admin only)
const createAnnouncement = async (req, res) => {
  try {
    const { title, body } = req.body;
    const announcement = await Announcement.create({ title, body, postedBy: req.user._id });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: "Failed to post announcement", error: err.message });
  }
};

// GET /api/announcements  (everyone can view)
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("postedBy", "name")
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch announcements", error: err.message });
  }
};

module.exports = { createAnnouncement, getAnnouncements };
