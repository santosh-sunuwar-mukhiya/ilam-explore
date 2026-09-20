import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "./config/env.js";

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The frontend must be able to send the HttpOnly auth cookies, so CORS needs
// credentials. Configure an allowlist with ALLOWED_ORIGINS="https://a,https://b";
// when it is not set, any origin is reflected outside production.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // requests without an Origin header (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.length === 0) {
        return callback(null, process.env.NODE_ENV !== "production");
      }

      return callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// seeded / downloaded place photos and other public assets
app.use("/static", express.static(path.join(__dirname, "../public/images")));

// routes
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import placeRouter from "./routes/place.route.js";
import adminRouter from "./routes/admin.route.js";
import reviewRouter from "./routes/review.route.js";
import tripRouter from "./routes/trip.route.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", userRouter);
app.use("/api/v1/places", placeRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/trip", tripRouter);

app.get("/api/health", (req, res) => {
  res.send("I am making Explore Ilam Website");
});

// 404 + central error handling (keep last)
app.use(notFound);
app.use(errorHandler);

export default app;
