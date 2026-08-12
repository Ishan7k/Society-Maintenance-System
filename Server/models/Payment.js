const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    billRef: { type: mongoose.Schema.Types.ObjectId, ref: "MaintenanceBill", required: true },
    flatRef: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    mode: { type: String, enum: ["cash", "upi", "card", "bank_transfer"], default: "upi" },
    transactionNote: { type: String, trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
