// server/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/user.auth.routes.js";

// Load environment variables
dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173", // Vite's default port
  credentials: true
}));
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("Public"));
app.use(cookieParser());

app.use("/api/v1/users", authRoutes);

export { app };