const mongoose = require("mongoose");

// This is meant to hold exactly ONE document — the society's own profile.
// We don't have a "societyId" anywhere else because this app manages a
// single society, not multiple societies (multi-tenancy would be a
// natural future enhancement, noted in known-limitations).
const societySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: "My Society" },
    address: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Society", societySchema);
