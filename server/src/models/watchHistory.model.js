import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema(
{
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},

	video: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Video",
		required: true
	},

	watchedSeconds: {
		type: Number,
		default: 0
	},

	completed: {
		type: Boolean,
		default: false
	},

	lastWatchedAt: {
		type: Date,
		default: Date.now
	}

},
{ timestamps: true }
);

// one user should have only one record per video
watchHistorySchema.index({ user: 1, video: 1 }, { unique: true });

const WatchHistory = mongoose.model("WatchHistory", watchHistorySchema);

export default WatchHistory;