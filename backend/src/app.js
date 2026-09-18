import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// routes
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", userRouter);

export default app;
