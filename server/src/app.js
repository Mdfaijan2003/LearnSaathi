import express from "express";
// import cors from "cors";
// import cookiieParser from "cookie-parser";

// import authRoutes from "./routes/auth.routes.js";

const app = express();

// app.use(cors({
//   origin: process.env.CORS_ORIGIN,
//   credentials: true
// }));
// app.use(express.json({limit: "10mb"}));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// app.use(express.static("Public"));
// app.use(cookiieParser());

// app.use("/api/auth", authRoutes);

export { app };