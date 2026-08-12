const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    flatRef: { type: mongoose.Schema.Types.ObjectId, ref: "Flat", required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: ["plumbing", "electrical", "security", "cleaning", "parking", "other"],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "in-progress", "resolved"], default: "open" },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
