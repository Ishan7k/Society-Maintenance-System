// Catches anything not already handled inside a controller's try/catch,
// plus Mongoose validation and cast errors, and returns a clean JSON
// response instead of leaking a stack trace to the client.
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(", ") });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid ID format: ${err.value}` });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: "Duplicate entry - this record already exists" });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong on the server",
  });
};

const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };
