require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const flatRoutes = require("./routes/flatRoutes");
const billRoutes = require("./routes/billRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const societyRoutes = require("./routes/societyRoutes");

const app = express();

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "https://society-maintenance-system.vercel.app", // update this after Vercel deploy if the URL differs
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "Society Maintenance Management System API running" }));

app.use("/api/auth", authRoutes);
app.use("/api/flats", flatRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/society", societyRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
