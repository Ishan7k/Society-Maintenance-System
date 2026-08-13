# Test Cases & Sample Data

All test cases below were run manually against both the local development environment and the live deployed environment, using the seeded sample data (10 flats, 4 months of bill history, admin + 10 resident accounts). Each case lists the input, expected result, and actual result.

## Sample Test Data (from seed script)

- **Admin account:** admin@test.com / admin123
- **10 resident accounts:** resident1@test.com through resident10@test.com, password resident123, each linked to flats A-101 through A-110
- **Bill history:** 4 months (2026-05 through 2026-08) per flat, with a realistic mix of paid, pending, and overdue statuses
- **4 sample complaints** across different categories and statuses (open, in-progress, resolved)
- **2 sample announcements**

---

## Authentication & Authorization

| # | Test Case | Input | Expected Result | Actual Result |
|---|---|---|---|---|
| 1 | Valid admin login | admin@test.com / admin123 | 200, returns JWT + user object with role "admin" | Pass |
| 2 | Valid resident login | resident1@test.com / resident123 | 200, returns JWT + user object with role "resident" | Pass |
| 3 | Invalid password | admin@test.com / wrongpass | 401, "Invalid email or password" | Pass |
| 4 | Non-existent email | ghost@test.com / anything | 401, "Invalid email or password" | Pass |
| 5 | Access protected route with no token | GET /api/bills, no Authorization header | 401, "Not authorized, no token provided" | Pass |
| 6 | Access protected route with invalid token | GET /api/bills, garbage token | 401, "Not authorized, invalid or expired token" | Pass |
| 7 | Resident attempts admin-only route | Resident token to POST /api/bills/generate | 403, "Access denied: insufficient permissions" | Pass |
| 8 | Resident attempts to view another flat's bill directly by ID | Resident1 token to GET /api/bills/:id belonging to Flat A-105 | 403, "Access denied: not your bill" | Pass |

---

## Flats & Residents

| # | Test Case | Input | Expected Result | Actual Result |
|---|---|---|---|---|
| 9 | Admin creates a new flat | POST /api/flats with unique unitNumber "B-201" | 201, flat created | Pass |
| 10 | Duplicate unit number rejected | POST /api/flats with unitNumber "A-101" (already exists) | 400, "A flat with this unit number already exists" | Pass |
| 11 | Resident views flat list | Resident token to GET /api/flats | 200, returns array with only their own flat | Pass |
| 12 | Admin views flat list | Admin token to GET /api/flats | 200, returns all flats | Pass |
| 13 | Admin links a resident to an existing unlinked flat | POST /api/auth/register with flatId of an unlinked flat | 201, resident created and flat.residentRef updated | Pass |
| 14 | Attempt to link a second resident to an already-linked flat | POST /api/auth/register with flatId of a flat that already has a resident | 400, "This flat already has a resident linked to it" | Pass |

---

## Bill Generation & Duplicate Prevention

| # | Test Case | Input | Expected Result | Actual Result |
|---|---|---|---|---|
| 15 | Bulk generate bills for a new month | POST /api/bills/generate, month "2026-09", all flats have no bill yet for that month | 201, created equals total flat count, skipped is 0 | Pass |
| 16 | Re-run bulk generate for the same month | Same request repeated immediately after Test 15 | 201, created is 0, skipped equals total flat count, no duplicates created | Pass |
| 17 | Generate single bill for one flat | POST /api/bills/generate-single with a flat + new month combination | 201, bill created | Pass |
| 18 | Generate single bill for a flat+month that already has a bill | Same flat + month as an existing bill | 400, "A bill for 2026-09 already exists for this flat" | Pass |
| 19 | Single bill with custom amount override | amount 2800 passed explicitly, flat's default is 2500 | Bill created with amount 2800, not the flat default | Pass |

---

## Payments

| # | Test Case | Input | Expected Result | Actual Result |
|---|---|---|---|---|
| 20 | Resident pays their own pending bill, correct amount | POST /api/payments, amount matches bill exactly | 201, payment recorded, linked bill status becomes "paid" | Pass |
| 21 | Payment amount mismatch | amount sent does not equal bill.amount | 400, "Amount mismatch: bill amount is X, received Y" | Pass |
| 22 | Attempt to pay an already-paid bill | POST /api/payments on a bill with status "paid" | 400, "This bill is already paid" | Pass |
| 23 | Resident attempts to pay another flat's bill | Resident1 token, billId belonging to Flat A-105 | 403, "Access denied: not your bill" | Pass |
| 24 | Admin views all payments | Admin token to GET /api/payments | 200, returns payments from all flats | Pass |

---

## Overdue Logic

| # | Test Case | Input | Expected Result | Actual Result |
|---|---|---|---|---|
| 25 | Bill past due date, still pending | GET /api/bills on a flat with a bill whose dueDate is in the past and status is "pending" | Status automatically updated to "overdue" in the response and in the database | Pass |
| 26 | Bill already paid, past due date | Same as above but status is "paid" | Status remains "paid", a paid bill is never marked overdue | Pass |

---

## Complaints

| # | Test Case | Input | Expected Result | Actual Result |
|---|---|---|---|---|
| 27 | Resident raises a complaint | POST /api/complaints with category + description | 201, complaint created with status "open" | Pass |
| 28 | Admin updates complaint to "resolved" | PUT /api/complaints/:id, status "resolved" | 200, status updated, resolvedAt timestamp set | Pass |
| 29 | Resident views only their own complaints | Resident token to GET /api/complaints | 200, returns only complaints for their flat | Pass |
| 30 | Resident attempts to update complaint status | Resident token to PUT /api/complaints/:id | 403, admin-only route | Pass |

---

## Dashboards

| # | Test Case | Input | Expected Result | Actual Result |
|---|---|---|---|---|
| 31 | Admin dashboard totals | GET /api/dashboard/admin | 200, totalCollected/totalPending/totalOverdueAmount reflect actual sum of bill amounts by status | Pass |
| 32 | Resident dashboard totalDue | GET /api/dashboard/resident | 200, totalDue equals sum of that resident's non-paid bills | Pass |

---

## File Uploads

| # | Test Case | Input | Expected Result | Actual Result |
|---|---|---|---|---|
| 33 | Admin uploads society logo | POST /api/society/logo, valid image file | 200, logoUrl updated to a Cloudinary URL, visible in navbar | Pass |
| 34 | User uploads profile photo | POST /api/auth/profile-photo, valid image file | 200, profileImage updated on user, visible in navbar/profile page | Pass |

---

## Frontend / Routing

| # | Test Case | Input | Expected Result | Actual Result |
|---|---|---|---|---|
| 35 | Direct navigation to a nested route on Vercel | Visit /login or /admin/dashboard directly, not via in-app navigation | Page loads correctly, not a 404 | Pass, after adding vercel.json SPA rewrite |
| 36 | Session persists across page refresh | Log in, refresh the page | User remains logged in, redirected to correct dashboard | Pass |
| 37 | Logout clears session | Click logout | Token and user removed from localStorage, redirected to /login | Pass |
