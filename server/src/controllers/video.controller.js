import Video from "../models/video.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadCloudinary } from "../utils/cloudinary.js";


// Upload Video
export const uploadVideo = asyncHandler(async (req, res) => {

  if (req.user.role !== "teacher" && req.user.teacherStatus !== "approved") {
    throw new ApiError(403, "Only approved teachers can upload videos");
  }

  const {
    title,
    description,
    program,
    subject,
    chapter,
    topic,
    videoType,
    youtubeUrl,
    duration,
    isFree
  } = req.body;

  if (!title || !program || !subject || !videoType) {
    throw new ApiError(400, "Required fields missing");
  }

  let videoUrl = "";

  if (videoType === "youtube") {

    if (!youtubeUrl) {
      throw new ApiError(400, "Youtube URL required");
    }

    videoUrl = youtubeUrl;

  } else {

    const videoLocalPath = req.files?.video?.[0]?.path;

    if (!videoLocalPath) {
      throw new ApiError(400, "Video file required");
    }

    const uploadedVideo = await uploadCloudinary(videoLocalPath);

    if (!uploadedVideo) {
      throw new ApiError(500, "Video upload failed");
    }

    videoUrl = uploadedVideo.secure_url;
  }

  const video = await Video.create({
    title,
    description,
    program,
    subject,
    chapter,
    topic,
    videoType,
    videoUrl,
    duration,
    uploadedBy: req.user._id,
    isFree
  });

  return res.status(201).json(
    new ApiResponse(201, video, "Video uploaded successfully")
  );

});


// Get Single Video
export const getVideoById = asyncHandler(async (req, res) => {

  const video = await Video.findById(req.params.videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.views += 1;
  await video.save();

  return res.status(200).json(
    new ApiResponse(200, video, "Video fetched successfully")
  );

});


// Get Videos by Topic
export const getVideosByTopic = asyncHandler(async (req, res) => {

  const videos = await Video.find({
    topic: req.params.topicId
  });

  return res.status(200).json(
    new ApiResponse(200, videos, "Videos fetched successfully")
  );

});


// Get Videos by Chapter
export const getVideosByChapter = asyncHandler(async (req, res) => {

  const videos = await Video.find({
    chapter: req.params.chapterId
  });

  return res.status(200).json(
    new ApiResponse(200, videos, "Videos fetched successfully")
  );

});


// Get Videos by Subject
export const getVideosBySubject = asyncHandler(async (req, res) => {

  const videos = await Video.find({
    subject: req.params.subjectId
  });

  return res.status(200).json(
    new ApiResponse(200, videos, "Videos fetched successfully")
  );

});


// Get Videos by Program
export const getVideosByProgram = asyncHandler(async (req, res) => {

  const videos = await Video.find({
    program: req.params.programId
  });

  return res.status(200).json(
    new ApiResponse(200, videos, "Videos fetched successfully")
  );

});


// Search Videos
export const searchVideos = asyncHandler(async (req, res) => {

    const { q } = req.query;

    if (!q) {
        throw new ApiError(400, "Search query required");
    }

    const videos = await Video.find({
        $text: { $search: q }
    },{
    score: { $meta: "textScore" }
    })
    .sort({ score: { $meta: "textScore" } });

    return res.status(200).json(
        new ApiResponse(200, videos, "Search results fetched")
    );

});