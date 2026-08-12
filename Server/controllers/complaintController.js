const Complaint = require("../models/Complaint");

// POST /api/complaints  (resident raises a complaint for their own flat)
const createComplaint = async (req, res) => {
  try {
    if (!req.user.flatRef) {
      return res.status(400).json({ message: "Only residents linked to a flat can raise complaints" });
    }
    const { category, description } = req.body;
    const complaint = await Complaint.create({
      flatRef: req.user.flatRef,
      raisedBy: req.user._id,
      category,
      description,
    });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: "Failed to create complaint", error: err.message });
  }
};

// GET /api/complaints  (admin: all, resident: own only)
const getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== "admin") {
      if (!req.user.flatRef) return res.json([]);
      query.flatRef = req.user.flatRef;
    }
    if (req.query.status) query.status = req.query.status;

    const complaints = await Complaint.find(query)
      .populate("flatRef", "unitNumber")
      .populate("raisedBy", "name")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch complaints", error: err.message });
  }
};

// PUT /api/complaints/:id  (admin updates status)
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === "resolved") update.resolvedAt = new Date();

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: "Failed to update complaint", error: err.message });
  }
};

module.exports = { createComplaint, getComplaints, updateComplaintStatus };
