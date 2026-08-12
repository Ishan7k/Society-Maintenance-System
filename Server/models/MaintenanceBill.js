const mongoose = require("mongoose");

const maintenanceBillSchema = new mongoose.Schema(
  {
    flatRef: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    month: { type: String, required: true }, // format: "2026-08"
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["pending", "paid", "overdue"], default: "pending" },
    paidOn: { type: Date, default: null },
  },
  { timestamps: true }
);

// CORE BUSINESS RULE: one bill per flat per month, enforced at the DB level
// If someone tries to generate August bills twice, this throws a duplicate key error (E11000)
// which the controller catches and skips gracefully instead of crashing.
maintenanceBillSchema.index({ flatRef: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("MaintenanceBill", maintenanceBillSchema);
