# API Documentation

Base URL (local): `http://localhost:5000/api`
Base URL (live): `https://society-maintenance-system-7put.onrender.com/api`

All endpoints except `/auth/login` require a JWT sent as:
```
Authorization: Bearer <token>
```

Routes marked **(admin)** or **(resident)** are restricted by role via server-side middleware. Unmarked routes are accessible to any authenticated user, but often return role-filtered data (e.g. a resident only ever sees their own bills, regardless of what a request includes).

---

## Auth

### `POST /auth/login`
Public. Logs in and returns a JWT + user object.

**Body:**
```json
{ "email": "admin@test.com", "password": "admin123" }
```
**Response `200`:**
```json
{ "user": { "_id": "...", "name": "Admin", "role": "admin", ... }, "token": "eyJhbGciOi..." }
```
**Response `401`:** `{ "message": "Invalid email or password" }`

### `POST /auth/register` **(admin)**
Creates a new user (admin or resident). If `flatId` is provided, links the new user to that flat as its resident.

**Body:**
```json
{ "name": "Priya Sharma", "email": "priya@test.com", "password": "pass123", "phone": "9876543210", "role": "resident", "flatId": "<flat ObjectId>" }
```
**Response `201`:** created user object + token.
**Response `400`:** if email already exists, or the target flat already has a resident linked.

### `GET /auth/me`
Returns the currently logged-in user's own profile.

### `POST /auth/profile-photo`
Uploads a profile photo for the logged-in user. `multipart/form-data`, field name `photo`.

---

## Flats

### `GET /flats`
Admin: returns all flats. Resident: returns only their own flat (array with 0 or 1 item).

### `POST /flats` **(admin)**
**Body:**
```json
{ "unitNumber": "A-101", "block": "A", "ownerName": "Rohan Mehta", "type": "owner", "monthlyMaintenanceAmount": 2500 }
```

### `PUT /flats/:id` **(admin)**
Updates any field on a flat.

---

## Bills

### `POST /bills/generate` **(admin)**
Generates a bill for **every** flat for the given month. Silently skips flats that already have a bill for that month (relies on the unique index — this is expected behavior, not an error).

**Body:**
```json
{ "month": "2026-08", "dueDate": "2026-08-10" }
```
**Response `201`:**
```json
{ "message": "Bill generation complete for 2026-08", "created": 8, "skipped": 2, "totalFlats": 10 }
```

### `POST /bills/generate-single` **(admin)**
Generates (or overrides the amount for) a bill for one specific flat.

**Body:**
```json
{ "flatId": "<flat ObjectId>", "month": "2026-08", "dueDate": "2026-08-10", "amount": 2800 }
```
`amount` is optional — defaults to the flat's `monthlyMaintenanceAmount` if omitted.

### `GET /bills`
Admin: all bills, optionally filtered with `?month=2026-08` and/or `?status=overdue`. Resident: only their own flat's bills. Overdue status is recalculated on every read (check-on-read pattern).

### `GET /bills/:id`
Returns a single bill. A resident requesting a bill that isn't theirs gets `403`.

---

## Payments

### `POST /payments`
Records a payment against a bill. Amount must exactly match the bill's amount, or the request is rejected. On success, the linked bill is marked `paid`.

**Body:**
```json
{ "billId": "<bill ObjectId>", "amount": 2500, "mode": "upi", "transactionNote": "Paid via SMMS portal" }
```
**Response `400`:** amount mismatch, or bill already paid.
**Response `403`:** resident attempting to pay a bill that isn't theirs.

### `GET /payments`
Admin: all payments. Resident: only their own.

---

## Complaints

### `POST /complaints`
Raises a complaint for the logged-in resident's own flat.

**Body:**
```json
{ "category": "plumbing", "description": "Water leakage near parking area." }
```

### `GET /complaints`
Admin: all complaints, optional `?status=open` filter. Resident: only their own.

### `PUT /complaints/:id` **(admin)**
Updates complaint status.

**Body:**
```json
{ "status": "resolved" }
```

---

## Announcements

### `POST /announcements` **(admin)**
**Body:**
```json
{ "title": "Water Supply Maintenance", "body": "Water will be off from 10 AM to 2 PM on Aug 12." }
```

### `GET /announcements`
Visible to all logged-in users.

---

## Dashboard

### `GET /dashboard/admin` **(admin)**
Returns aggregated totals: `totalFlats`, `totalCollected`, `totalPending`, `totalOverdueAmount`, `overdueCount`, `complaintBreakdown`.

### `GET /dashboard/resident` **(resident)**
Returns `totalDue`, `pendingBillsCount`, `recentBills` (last 6), and `complaints` for the logged-in resident's flat.

---

## Society

### `GET /society`
Returns the society's branding info (auto-creates a default document on first access).

### `PUT /society` **(admin)**
Updates name/address/contact details.

### `POST /society/logo` **(admin)**
Uploads/replaces the society logo. `multipart/form-data`, field name `logo`.

---

## Error Format

All errors return JSON in the shape:
```json
{ "message": "Human-readable description of what went wrong" }
```
Common status codes used: `400` (validation/business rule failure), `401` (not authenticated / bad token), `403` (authenticated but not authorized for this resource), `404` (not found), `500` (unexpected server error).
