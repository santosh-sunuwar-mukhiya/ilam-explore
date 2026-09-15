import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json({limit:'1mb'}));

export default app;
