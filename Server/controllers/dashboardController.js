const MaintenanceBill = require("../models/MaintenanceBill");
const Complaint = require("../models/Complaint");
const Flat = require("../models/Flat");
const { markOverdueIfNeeded } = require("../utils/overdueChecker");

// GET /api/dashboard/admin
// Answers the real question a society secretary asks every month:
// "how much have we collected, how much is still owed, and what's broken?"
const getAdminDashboard = async (req, res) => {
  try {
    let bills = await MaintenanceBill.find();
    bills = await markOverdueIfNeeded(bills);

    const totalCollected = bills.filter((b) => b.status === "paid").reduce((sum, b) => sum + b.amount, 0);
    const totalPending = bills.filter((b) => b.status === "pending").reduce((sum, b) => sum + b.amount, 0);
    const totalOverdueAmount = bills.filter((b) => b.status === "overdue").reduce((sum, b) => sum + b.amount, 0);
    const overdueCount = bills.filter((b) => b.status === "overdue").length;

    const totalFlats = await Flat.countDocuments();

    const complaints = await Complaint.find();
    const complaintBreakdown = {
      open: complaints.filter((c) => c.status === "open").length,
      inProgress: complaints.filter((c) => c.status === "in-progress").length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
    };

    res.json({
      totalFlats,
      totalCollected,
      totalPending,
      totalOverdueAmount,
      overdueCount,
      complaintBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard", error: err.message });
  }
};

// GET /api/dashboard/resident
// Answers: "what do I owe, and what's the status of my complaints?"
const getResidentDashboard = async (req, res) => {
  try {
    if (!req.user.flatRef) return res.json({ message: "No flat linked to this account" });

    let bills = await MaintenanceBill.find({ flatRef: req.user.flatRef }).sort({ year: -1, month: -1 });
    bills = await markOverdueIfNeeded(bills);

    const pendingBills = bills.filter((b) => b.status !== "paid");
    const totalDue = pendingBills.reduce((sum, b) => sum + b.amount, 0);

    const complaints = await Complaint.find({ flatRef: req.user.flatRef }).sort({ createdAt: -1 });

    res.json({
      totalDue,
      pendingBillsCount: pendingBills.length,
      recentBills: bills.slice(0, 6),
      complaints,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard", error: err.message });
  }
};

module.exports = { getAdminDashboard, getResidentDashboard };
