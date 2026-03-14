import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import passport from "passport";
import passport from "./config/passport.js";

import authRoutes from "./routes/user.auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import programRoutes from "./routes/program.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import chapterRoutes from "./routes/chapter.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import videoRoutes from "./routes/video.routes.js";
import watchHistoryRoutes from "./routes/watchHistory.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import ratingRoutes from "./routes/rating.routes.js";
import noteRoutes from "./routes/note.routes.js";
import userNoteRoutes from "./routes/userNote.routes.js";
import questionRoutes from "./routes/question.routes.js";
import attemptRoutes from "./routes/attempt.routes.js";
import testRoutes from "./routes/test.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import bookmarkRoutes from "./routes/bookmark.routes.js";
import courseRoutes from "./routes/course.routes.js";
import courseModuleRoutes from "./routes/courseModule.routes.js";
import courseLectureRoutes from "./routes/courseLecture.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js"; 
import otpRoutes from "./routes/otp.routes.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(passport.initialize());
// app.use(passport.session());


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/auth/otp", otpRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/programs", programRoutes);
app.use("/api/v1/subjects", subjectRoutes);
app.use("/api/v1/chapters", chapterRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/watch-history", watchHistoryRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/ratings", ratingRoutes);
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/user-notes", userNoteRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/attempts", attemptRoutes);
app.use("/api/v1/tests", testRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/bookmarks", bookmarkRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/course-modules", courseModuleRoutes);
app.use("/api/v1/course-lectures", courseLectureRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);

/* Health check */

app.get("/health", (req,res)=>{
  res.status(200).json({status:"ok"});
});

export { app };