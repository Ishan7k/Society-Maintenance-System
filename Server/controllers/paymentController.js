const Payment = require("../models/Payment");
const MaintenanceBill = require("../models/MaintenanceBill");

// POST /api/payments
// body: { billId, amount, mode, transactionNote }
// A resident pays their own bill, or an admin records a payment on
// someone's behalf (e.g. cash paid in person). Amount must match the
// bill amount exactly — this is the "business validation" the brief asks for.
const recordPayment = async (req, res) => {
  try {
    const { billId, amount, mode, transactionNote } = req.body;

    const bill = await MaintenanceBill.findById(billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    // authorization: resident can only pay their own bill
    if (req.user.role === "resident" && String(bill.flatRef) !== String(req.user.flatRef)) {
      return res.status(403).json({ message: "Access denied: not your bill" });
    }

    if (bill.status === "paid") {
      return res.status(400).json({ message: "This bill is already paid" });
    }

    if (Number(amount) !== bill.amount) {
      return res.status(400).json({
        message: `Amount mismatch: bill amount is ₹${bill.amount}, received ₹${amount}`,
      });
    }

    const payment = await Payment.create({
      billRef: bill._id,
      flatRef: bill.flatRef,
      amount,
      mode,
      transactionNote,
      recordedBy: req.user._id,
    });

    // sync: mark the bill paid immediately
    bill.status = "paid";
    bill.paidOn = new Date();
    await bill.save();

    res.status(201).json({ message: "Payment recorded successfully", payment, bill });
  } catch (err) {
    res.status(500).json({ message: "Failed to record payment", error: err.message });
  }
};

// GET /api/payments
const getPayments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== "admin") {
      if (!req.user.flatRef) return res.json([]);
      query.flatRef = req.user.flatRef;
    }
    const payments = await Payment.find(query)
      .populate("flatRef", "unitNumber")
      .populate("billRef", "month amount")
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payments", error: err.message });
  }
};

module.exports = { recordPayment, getPayments };
