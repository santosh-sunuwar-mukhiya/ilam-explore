import { ApiError } from "../utils/ApiError.js";

// 404 handler for unknown routes (must be registered after all routes)
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

// Central error handler: keeps ApiError status codes, maps common Mongoose
// errors to proper client errors, and falls back to 500.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err instanceof ApiError ? err.statusCode : 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  if (!(err instanceof ApiError)) {
    if (err.name === "MulterError") {
      // upload limits / wrong field name
      statusCode = 400;
      message =
        err.code === "LIMIT_FILE_SIZE"
          ? `File too large (maximum ${process.env.MAX_UPLOAD_MB || 5} MB)`
          : err.message;
      errors = [];
    } else if (err.name === "ValidationError") {
      // Mongoose schema validation failed
      statusCode = 400;
      message = "Validation failed";
      errors = Object.values(err.errors || {}).map((e) => e.message);
    } else if (err.name === "CastError") {
      // invalid ObjectId or wrong type
      statusCode = 400;
      message = `Invalid ${err.path}: ${err.value}`;
      errors = [];
    } else if (err.code === 11000) {
      // duplicate unique index (e.g. email, slug)
      statusCode = 409;
      const fields = Object.keys(err.keyValue || {}).join(", ");
      message = fields ? `Duplicate value for: ${fields}` : "Duplicate value";
      errors = [];
    }
  }

  // Unexpected (non-ApiError) failures are logged, never hidden.
  if (statusCode >= 500) {
    console.error("Unexpected error:", err);
  }

  return res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    errors,
    data: null,
  });
};
