import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import passport from "passport";
import passport from "./config/passport.js";


import authRoutes from "./routes/user.auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import ProgramRoutes from "./routes/program.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import chapterRoutes from "./routes/chapter.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import videoRoutes from "./routes/video.routes.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    errors: err.errors || [],
  });
});
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/programs", ProgramRoutes);
app.use("/api/v1/subjects", subjectRoutes);
app.use("/api/v1/chapters", chapterRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/videos", videoRoutes);
export { app };