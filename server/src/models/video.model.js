import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
{
	title: {
		type: String,
		required: true,
		trim: true
	},

	description: {
		type: String
	},

	program: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Program",
		required: true
	},

	subject: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Subject",
		required: true
	},

	chapter: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Chapter"
	},

	topic: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Topic"
	},

	videoType: {
		type: String,
		enum: ["internal", "youtube"],
		required: true
	},

	videoUrl: {
		type: String,
		required: true
	},

	thumbnail: {
		type: String
	},

	duration: {
		type: Number
	},

	uploadedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},

	isFree: {
		type: Boolean,
		default: true
	},

	views: {
		type: Number,
		default: 0
	},

	ratingAverage: {
		type: Number,
		default: 0
	},

	ratingCount: {
		type: Number,
		default: 0
	}

},
{ timestamps: true }
);

//
// 🔹 SEARCH INDEX
//
videoSchema.index({ title: "text", description: "text" });

//
// 🔹 FILTERING INDEXES
//
videoSchema.index({ program: 1, subject: 1 });
videoSchema.index({ subject: 1, chapter: 1 });
videoSchema.index({ chapter: 1 });
videoSchema.index({ topic: 1 });

//
// 🔹 SORTING INDEXES
//
videoSchema.index({ views: -1 });
videoSchema.index({ ratingAverage: -1 });
videoSchema.index({ createdAt: -1 });

const Video = mongoose.model("Video", videoSchema);

export default Video;