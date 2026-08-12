const mongoose = require("mongoose");

const flatSchema = new mongoose.Schema(
  {
    unitNumber: { type: String, required: true, unique: true, trim: true }, // e.g. "A-101"
    block: { type: String, trim: true },
    ownerName: { type: String, required: true, trim: true },
    type: { type: String, enum: ["owner", "tenant"], default: "owner" },
    monthlyMaintenanceAmount: { type: Number, required: true, default: 2500 },
    residentRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Flat", flatSchema);
