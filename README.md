# Society Maintenance Management System (SMMS)

A full-stack web application that digitizes the day-to-day maintenance workflow of a residential society — bill generation, payment tracking, complaint management, and admin reporting — replacing scattered registers and WhatsApp-group chaos with a single, role-based system.

**Live App:** https://society-maintenance-system-lyart.vercel.app
**Live API:** https://society-maintenance-system-7put.onrender.com
**Demo Video:** https://youtu.be/7KYf8egT17k

> Note: the backend is hosted on Render's free tier, which sleeps after periods of inactivity. The first request after a period of inactivity may take 30–60 seconds to respond while the server wakes up.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Resident | resident1@test.com | resident123 |
| Resident (alt) | resident2@test.com ... resident10@test.com | resident123 |

---

## Project Overview

Every residential society runs the same monthly cycle: collect maintenance dues, chase the people who haven't paid, log complaints, and somehow communicate updates to everyone — usually across a mix of paper registers, Excel sheets, and a WhatsApp group nobody reads properly.

SMMS replaces that with a centralized system with two roles:

- **Admin (society secretary):** manages flats and residents, generates monthly maintenance bills for all flats in one action, tracks who's paid/pending/overdue, manages complaints end-to-end, posts announcements, and sees a real-time dashboard of collections and dues.
- **Resident:** sees only their own flat's bills and payment history, pays pending bills, raises and tracks complaints, and reads society announcements.

The system enforces real business rules server-side (not just hidden in the UI) — a resident cannot view or pay another flat's bill even by calling the API directly, and the same month cannot be billed twice for the same flat.

---

## Key Features

- **Role-based authentication (JWT)** — admin and resident roles enforced at the API level via middleware, not just hidden UI elements
- **Bulk + individual bill generation** — generate a month's bills for every flat in one click, or generate/adjust a bill for a single flat
- **Duplicate-bill prevention** — enforced at the database level via a unique compound index on (flat, month)
- **Automatic overdue detection** — bills past their due date are automatically reclassified as overdue whenever they're read
- **Payment recording with validation** — payment amount must match the bill amount exactly; recording a payment instantly syncs the bill's status
- **Complaint management** — residents raise complaints by category, admin tracks and updates status (open → in-progress → resolved)
- **Society branding** — admin can upload a society logo and update society details, shown across the app
- **Profile photos** — both admin and residents can upload a profile photo (Cloudinary-hosted)
- **Admin dashboard** — real-time totals for collected/pending/overdue amounts and complaint breakdown, computed via MongoDB aggregation
- **Resident dashboard** — personal dues summary, recent bill history, complaint status
- **Realistic seed data** — 10 flats, 4 months of bill history with a genuine mix of paid/pending/overdue bills, sample complaints and announcements, so the app is demonstrable out of the box rather than showing empty tables

---

## Tech Stack

**Frontend:** React (Vite), React Router, React Bootstrap, Axios
**Backend:** Node.js, Express.js
**Database:** MongoDB (Atlas), Mongoose ODM
**Auth:** JSON Web Tokens (JWT), bcrypt for password hashing
**File storage:** Cloudinary (society logo + profile photos)
**Deployment:** Render (backend), Vercel (frontend)

---

## Folder Structure

```
society-maintenance/
├── Server/
│   ├── config/          # DB and Cloudinary connection setup
│   ├── models/          # Mongoose schemas (User, Flat, MaintenanceBill, Payment, Complaint, Announcement, Society)
│   ├── controllers/     # Business logic per resource
│   ├── routes/          # Express route definitions
│   ├── middleware/      # Auth, role-check, upload, error handling
│   ├── utils/           # Overdue-check logic, seed script
│   └── server.js        # App entry point
├── Client/
│   ├── src/
│   │   ├── api/          # Axios instance with auth interceptor
│   │   ├── context/       # AuthContext (login state)
│   │   ├── components/    # Navbar, ProtectedRoute
│   │   ├── pages/
│   │   │   ├── admin/     # Admin dashboard, flats, bills, complaints, announcements, settings
│   │   │   └── resident/  # Resident dashboard, bills, complaints, announcements
│   │   └── App.jsx        # Routing
│   └── vercel.json       # SPA routing config for Vercel
└── README.md
```

---

## Setup & Installation (Local Development)

### Prerequisites
- Node.js v18+
- A MongoDB Atlas account (free tier is enough) or a local MongoDB instance
- A Cloudinary account (free tier)

### 1. Clone the repository
```bash
git clone https://github.com/Ishan7k/Society-Maintenance-System.git
cd Society-Maintenance-System
```

### 2. Backend setup
```bash
cd Server
npm install
```

Create a `.env` file in `Server/` (copy from `.env.example`) with:
```
PORT=5000
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<any long random string>
CLOUDINARY_CLOUD_NAME=<your Cloudinary cloud name>
CLOUDINARY_API_KEY=<your Cloudinary API key>
CLOUDINARY_API_SECRET=<your Cloudinary API secret>
```

Seed the database with realistic sample data:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```
Backend runs at `http://localhost:5000`.

### 3. Frontend setup
```bash
cd ../Client
npm install
```

In `Client/src/api/axios.js`, set `API_BASE_URL` to `http://localhost:5000/api` for local development (it currently points to the live Render backend).

Start the frontend:
```bash
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `PORT` | Port the Express server runs on (default 5000) |
| `MONGO_URI` | MongoDB connection string, including database name |
| `JWT_SECRET` | Secret key used to sign JWT auth tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

---

## Deployment

- **Backend:** deployed on Render as a Node web service, with the environment variables above set directly in the Render dashboard. Root directory: `Server`. Build command: `npm install`. Start command: `npm start`.
- **Frontend:** deployed on Vercel, root directory `Client`, framework auto-detected as Vite. A `vercel.json` rewrite rule routes all paths to `index.html` so client-side routing (React Router) works correctly on direct navigation and page refresh.
- CORS on the backend is restricted to the deployed frontend origin and `localhost:5173` for local development.

---

## Assumptions Made

- One admin account manages a single society (multi-society/multi-tenant support is out of scope — see Known Limitations).
- Each flat has at most one resident account linked to it at a time.
- Maintenance amount is set per flat and can be overridden per bill if needed (e.g., a one-off adjustment).
- Payment is simulated (see Known Limitations) — no real payment gateway is connected, since gateway integration requires business KYC and sandbox setup outside the scope of this assessment.
- "Month" is stored as a string in `YYYY-MM` format for simplicity and human readability in the database.

---

## Documentation

- [Demo Video](https://youtu.be/7KYf8egT17k)
- [ER Diagram & Database Schema](./docs/ER-diagram.md)
- [API Documentation](./docs/API-docs.md)
- [Test Cases & Sample Data](./docs/test-cases.md)
- [Known Limitations & Future Enhancements](./docs/known-limitations.md)

---

## Author

Ishan Kashyap — Final Year Computer Engineering, SPPU Pune
Built for the Full Stack Developer technical project.
