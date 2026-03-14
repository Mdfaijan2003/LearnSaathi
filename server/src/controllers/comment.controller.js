import Comment from "../models/comment.model.js";
import Video from "../models/video.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// Create comment or reply
export const createComment = asyncHandler(async (req, res) => {

	const { videoId, text, parentComment } = req.body;

	if (!videoId || !text) {
		throw new ApiError(400, "Video ID and comment text are required");
	}

	// check video exists
	const video = await Video.findById(videoId);
	if (!video) {
		throw new ApiError(404, "Video not found");
	}

	// if replying, check parent comment exists
	if (parentComment) {
		const parent = await Comment.findById(parentComment);

		if (!parent) {
			throw new ApiError(404, "Parent comment not found");
		}
	}

	const isTeacher = req.user.role === "teacher";

	const comment = await Comment.create({
		video: videoId,
		user: req.user._id,
		text,
		parentComment: parentComment || null,
		isTeacher
	});

	return res.status(201).json(
		new ApiResponse(201, comment, "Comment added successfully")
	);

});


// Get top-level comments for a video (with pagination)
export const getVideoComments = asyncHandler(async (req, res) => {

	const { videoId } = req.params;

	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;

	const comments = await Comment.find({
		video: videoId,
		parentComment: null
	})
	.populate("user", "username avatar")
	.sort({ likesCount: -1, createdAt: -1 })
	.skip((page - 1) * limit)
	.limit(limit);

	return res.status(200).json(
		new ApiResponse(200, comments, "Comments fetched successfully")
	);

});


// Get replies for a comment
export const getReplies = asyncHandler(async (req, res) => {

	const { commentId } = req.params;

	const parent = await Comment.findById(commentId);

	if (!parent) {
		throw new ApiError(404, "Comment not found");
	}

	const replies = await Comment.find({
		parentComment: commentId
	})
	.populate("user", "username avatar")
	.sort({ createdAt: 1 });

	return res.status(200).json(
		new ApiResponse(200, replies, "Replies fetched successfully")
	);

});


// Pin comment (only video owner teacher)
export const pinComment = asyncHandler(async (req, res) => {

	if (req.user.role !== "teacher") {
		throw new ApiError(403, "Only teachers can pin comments");
	}

	const { commentId } = req.params;

	const comment = await Comment.findById(commentId).populate("video");

	if (!comment) {
		throw new ApiError(404, "Comment not found");
	}

	// teacher must own the video
	if (comment.video.uploadedBy.toString() !== req.user._id.toString()) {
		throw new ApiError(403, "You can only pin comments on your own videos");
	}

	comment.isPinned = true;
	await comment.save();

	return res.status(200).json(
		new ApiResponse(200, comment, "Comment pinned")
	);

});