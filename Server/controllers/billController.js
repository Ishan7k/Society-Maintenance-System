const MaintenanceBill = require("../models/MaintenanceBill");
const Flat = require("../models/Flat");
const { markOverdueIfNeeded } = require("../utils/overdueChecker");

// POST /api/bills/generate  (admin only)
// body: { month: "2026-08", dueDate: "2026-08-10" }
// Generates a bill for EVERY flat for the given month in one action.
// Relies on the unique (flatRef, month) index in the model to silently
// skip flats that already have a bill for that month instead of crashing
// the whole batch.
const generateBills = async (req, res) => {
  try {
    const { month, dueDate } = req.body;
    if (!month || !dueDate) {
      return res.status(400).json({ message: "month and dueDate are required" });
    }

    const flats = await Flat.find();
    const year = parseInt(month.split("-")[0]);

    let created = 0;
    let skipped = 0;

    for (const flat of flats) {
      try {
        await MaintenanceBill.create({
          flatRef: flat._id,
          month,
          year,
          amount: flat.monthlyMaintenanceAmount,
          dueDate: new Date(dueDate),
        });
        created++;
      } catch (err) {
        if (err.code === 11000) {
          skipped++; // bill for this flat+month already exists — expected, not an error
        } else {
          throw err;
        }
      }
    }

    res.status(201).json({
      message: `Bill generation complete for ${month}`,
      created,
      skipped,
      totalFlats: flats.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate bills", error: err.message });
  }
};

// POST /api/bills/generate-single  (admin only)
// body: { flatId, month, dueDate, amount (optional override) }
// For cases the bulk generator doesn't cover well: a new resident who
// joined mid-cycle, a one-off adjusted amount, or a bill for just one flat
// instead of running the batch job again.
const generateSingleBill = async (req, res) => {
  try {
    const { flatId, month, dueDate, amount } = req.body;
    if (!flatId || !month || !dueDate) {
      return res.status(400).json({ message: "flatId, month and dueDate are required" });
    }

    const flat = await Flat.findById(flatId);
    if (!flat) return res.status(404).json({ message: "Flat not found" });

    const year = parseInt(month.split("-")[0]);

    const bill = await MaintenanceBill.create({
      flatRef: flat._id,
      month,
      year,
      amount: amount || flat.monthlyMaintenanceAmount,
      dueDate: new Date(dueDate),
    });

    res.status(201).json(bill);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: `A bill for ${req.body.month} already exists for this flat` });
    }
    res.status(500).json({ message: "Failed to generate bill", error: err.message });
  }
};

// GET /api/bills
// Admin: all bills (with optional ?month= filter)
// Resident: only bills for their own flat — enforced server-side via req.user.flatRef,
// never trusts any flatId the client might send.
const getBills = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "admin") {
      if (req.query.month) query.month = req.query.month;
      if (req.query.status) query.status = req.query.status;
    } else {
      if (!req.user.flatRef) return res.json([]);
      query.flatRef = req.user.flatRef;
    }

    let bills = await MaintenanceBill.find(query)
      .populate("flatRef", "unitNumber block ownerName")
      .sort({ year: -1, month: -1 });

    bills = await markOverdueIfNeeded(bills);

    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bills", error: err.message });
  }
};

// GET /api/bills/:id
const getBillById = async (req, res) => {
  try {
    const bill = await MaintenanceBill.findById(req.params.id).populate("flatRef");
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    // authorization check: a resident can only view their own bill
    if (req.user.role === "resident" && String(bill.flatRef._id) !== String(req.user.flatRef)) {
      return res.status(403).json({ message: "Access denied: not your bill" });
    }

    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bill", error: err.message });
  }
};

module.exports = { generateBills, generateSingleBill, getBills, getBillById };
