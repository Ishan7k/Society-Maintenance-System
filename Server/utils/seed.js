// Run with: npm run seed
// Wipes existing data and creates realistic sample data:
// - 1 admin, 10 flats with residents
// - 4 months of bill history per flat, with a mix of paid / pending / overdue
// - a few complaints in different statuses
// - a couple of announcements
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Flat = require("../models/Flat");
const MaintenanceBill = require("../models/MaintenanceBill");
const Payment = require("../models/Payment");
const Complaint = require("../models/Complaint");
const Announcement = require("../models/Announcement");
const Society = require("../models/Society");

const FLAT_COUNT = 10;
const MONTHS = ["2026-05", "2026-06", "2026-07", "2026-08"]; // 4 months of history
const MONTHLY_AMOUNT = 2500;

const residentNames = [
  "Rohan Mehta", "Priya Sharma", "Amit Verma", "Sneha Kulkarni", "Vikram Rao",
  "Anjali Deshmukh", "Karan Joshi", "Neha Patil", "Suresh Iyer", "Pooja Nair",
];

const seed = async () => {
  await connectDB();
  console.log("Wiping existing data...");
  await Promise.all([
    User.deleteMany({}),
    Flat.deleteMany({}),
    MaintenanceBill.deleteMany({}),
    Payment.deleteMany({}),
    Complaint.deleteMany({}),
    Announcement.deleteMany({}),
    Society.deleteMany({}),
  ]);

  console.log("Creating society profile...");
  await Society.create({
    name: "Green Valley Residency",
    address: "Baner Road, Pune, Maharashtra 411045",
    contactEmail: "admin@greenvalley.test",
    contactPhone: "9876500000",
  });

  console.log("Creating admin...");
  const admin = await User.create({
    name: "Rajesh Kulkarni",
    email: "admin@test.com",
    password: "admin123",
    role: "admin",
    phone: "9876500000",
  });

  console.log(`Creating ${FLAT_COUNT} flats + residents...`);
  const flats = [];
  const residents = [];
  for (let i = 0; i < FLAT_COUNT; i++) {
    const unitNumber = `A-${101 + i}`;
    const flat = await Flat.create({
      unitNumber,
      block: "A",
      ownerName: residentNames[i],
      type: i % 3 === 0 ? "tenant" : "owner",
      monthlyMaintenanceAmount: MONTHLY_AMOUNT,
    });

    const resident = await User.create({
      name: residentNames[i],
      email: `resident${i + 1}@test.com`,
      password: "resident123",
      role: "resident",
      phone: `98765${String(10000 + i).slice(-5)}`,
      flatRef: flat._id,
    });

    flat.residentRef = resident._id;
    await flat.save();

    flats.push(flat);
    residents.push(resident);
  }

  console.log("Generating bill history with mixed statuses...");
  for (const flat of flats) {
    for (let m = 0; m < MONTHS.length; m++) {
      const month = MONTHS[m];
      const year = parseInt(month.split("-")[0]);
      const dueDate = new Date(`${month}-10`);

      const bill = await MaintenanceBill.create({
        flatRef: flat._id,
        month,
        year,
        amount: MONTHLY_AMOUNT,
        dueDate,
      });

      // simulate realistic mixed payment behavior:
      // - older months (May, June, July): mostly paid, a couple stay unpaid -> overdue
      // - current month (Aug): mostly pending, a couple already paid
      const isOldMonth = m < 3;
      const flatIndex = flats.indexOf(flat);
      const shouldBePaid = isOldMonth ? flatIndex % 4 !== 0 : flatIndex % 3 === 0;

      if (shouldBePaid) {
        await Payment.create({
          billRef: bill._id,
          flatRef: flat._id,
          amount: MONTHLY_AMOUNT,
          mode: ["upi", "cash", "card"][flatIndex % 3],
          transactionNote: "Seed data payment",
          recordedBy: admin._id,
        });
        bill.status = "paid";
        bill.paidOn = new Date(dueDate.getTime() - 2 * 24 * 60 * 60 * 1000);
        await bill.save();
      } else if (isOldMonth) {
        // unpaid + past due -> overdue
        bill.status = "overdue";
        await bill.save();
      }
      // else: leave as "pending" (current month, not yet due-checked)
    }
  }

  console.log("Creating sample complaints...");
  await Complaint.create([
    {
      flatRef: flats[0]._id,
      raisedBy: residents[0]._id,
      category: "plumbing",
      description: "Water leakage near the parking area basement wall.",
      status: "resolved",
      resolvedAt: new Date(),
    },
    {
      flatRef: flats[2]._id,
      raisedBy: residents[2]._id,
      category: "electrical",
      description: "Common area corridor light on 2nd floor not working.",
      status: "in-progress",
    },
    {
      flatRef: flats[4]._id,
      raisedBy: residents[4]._id,
      category: "security",
      description: "Main gate CCTV camera facing wrong direction after recent repair.",
      status: "open",
    },
    {
      flatRef: flats[6]._id,
      raisedBy: residents[6]._id,
      category: "cleaning",
      description: "Garbage collection missed twice this week near block A.",
      status: "open",
    },
  ]);

  console.log("Creating announcements...");
  await Announcement.create([
    {
      title: "Water Supply Maintenance - Aug 12",
      body: "Water supply will be interrupted from 10 AM to 2 PM on Aug 12 for tank cleaning.",
      postedBy: admin._id,
    },
    {
      title: "Society Annual Meeting",
      body: "Annual general body meeting scheduled for Aug 20, 6 PM, in the clubhouse.",
      postedBy: admin._id,
    },
  ]);

  console.log("\nSeed complete.");
  console.log("Admin login   -> admin@test.com / admin123");
  console.log("Resident login -> resident1@test.com / resident123 (through resident10@test.com)");

  mongoose.connection.close();
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
