// Usage: roleCheck("admin") on any route only admins should touch.
// This is what makes the role separation REAL instead of just a hidden
// button in the frontend — even if a resident hits the route directly
// with Postman, this blocks them.
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

module.exports = { roleCheck };
