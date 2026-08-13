# Known Limitations & Future Enhancements

This document is an honest account of what the current implementation does not cover, and how it would be extended toward a production-ready system. Being explicit about these tradeoffs was a deliberate choice made to prioritize a genuinely working, well-tested core workflow within the assessment timeframe, rather than a wider but shallower feature set.

## Known Limitations

**Payment is simulated, not integrated with a real gateway.**
Recording a payment currently marks a bill as paid immediately, without going through an actual payment processor. Integrating Razorpay or Stripe requires business KYC verification, sandbox/production API keys, and webhook handling for asynchronous payment confirmation — none of which fits within this assessment's scope and timeframe. The payment recording logic (amount validation, bill-status sync) is built so that a real gateway's webhook could call the same underlying logic with minimal changes.

**Single society, not multi-tenant.**
The `Society` collection stores exactly one document, and the app is designed to run one deployment per society. A production version serving multiple societies would need a `societyId` foreign key added to every collection (User, Flat, Bill, etc.), plus admin-scoping to enforce that one society's admin can never see another society's data.

**Overdue status uses check-on-read, not a scheduled job.**
A bill's status is reclassified from "pending" to "overdue" the next time it's read (via `GET /bills`), rather than through a nightly cron job. This means a bill that's overdue but nobody has viewed since it became overdue will show a stale status until the next read. At the current scale (one society, dozens to low hundreds of bills), this tradeoff is invisible in practice and avoids the operational overhead of a background job/worker process. At larger scale, a scheduled job (e.g. node-cron running daily) would be the more correct approach, and would also enable automated overdue-payment reminder emails.

**No email or SMS notifications.**
Bill generation, payment confirmation, and complaint status changes don't trigger any outbound notification. Residents have to log in to see updates. A production version would add email (e.g. via SendGrid/Nodemailer) or SMS notifications for bill generation, payment receipts, and complaint resolution.

**No automated test suite.**
All 37 test cases documented in `test-cases.md` were executed manually against both local and deployed environments. There is no Jest/Supertest automated suite in this submission. Given more time, converting these manual test cases into an automated suite would be a natural next step, and is a planned enhancement for this codebase beyond the assessment.

**No pagination on list endpoints.**
`GET /bills`, `GET /complaints`, `GET /payments`, etc. return their full result set in one response. This is fine at the current data scale (dozens of records) but would need cursor- or offset-based pagination before it could handle a large society's multi-year bill history efficiently.

**No rate limiting or request throttling.**
The API currently has no rate limiting middleware. A production deployment should add something like `express-rate-limit`, particularly on the login endpoint, to reduce brute-force attack surface.

**Render free tier cold starts.**
The deployed backend sleeps after 15 minutes of inactivity (Render free tier behavior), so the first request after a period of inactivity can take 30-60 seconds. A paid Render tier or an alternative host (Railway, Fly.io) would eliminate this in a real deployment.

**Flat-resident relationship is one-to-one.**
The current schema assumes exactly one resident account per flat. Real societies sometimes have joint accounts (both spouses wanting login access) or transitions between an outgoing and incoming tenant. This would need either a many-to-many User-Flat relationship or a household/family-member concept layered on top of the current schema.

**No audit trail.**
Changes to bills, payments, or complaint statuses aren't logged with a history of who changed what and when (beyond the `updatedAt` timestamp Mongoose adds automatically). A production system handling real money would benefit from an explicit audit log collection.

## Future Enhancements

- Real payment gateway integration (Razorpay/Stripe) with webhook-based confirmation
- Multi-society support with proper tenant isolation
- Automated overdue detection via scheduled job, paired with reminder notifications
- Email/SMS notifications for key events (bill generated, payment received, complaint resolved)
- Automated test suite (Jest + Supertest) covering the business logic documented in `test-cases.md`
- Pagination and server-side filtering/sorting on all list endpoints
- Rate limiting on authentication endpoints
- Downloadable PDF receipts for payments
- A simple analytics view showing month-over-month collection trends (the data model already supports this; it just needs an aggregation endpoint and a chart on the frontend)
- Audit logging for financial and administrative actions
- Support for multiple residents per flat (household accounts)
