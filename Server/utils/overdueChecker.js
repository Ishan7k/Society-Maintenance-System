// CHECK-ON-READ pattern for overdue status.
// Instead of running a cron job every night to flip statuses (which needs
// a background worker, extra infra, and can drift out of sync), we check
// and correct the status every time bills are actually read. This is simpler,
// needs zero extra infrastructure, and is always accurate at read-time —
// a fine trade-off for this scale. At production scale with millions of
// bills, a scheduled job would be worth the added complexity.
const markOverdueIfNeeded = async (bills) => {
  const MaintenanceBill = require("../models/MaintenanceBill");
  const today = new Date();
  const overdueIds = [];

  for (const bill of bills) {
    if (bill.status === "pending" && bill.dueDate < today) {
      bill.status = "overdue";
      overdueIds.push(bill._id);
    }
  }

  if (overdueIds.length > 0) {
    await MaintenanceBill.updateMany({ _id: { $in: overdueIds } }, { status: "overdue" });
  }

  return bills;
};

module.exports = { markOverdueIfNeeded };
