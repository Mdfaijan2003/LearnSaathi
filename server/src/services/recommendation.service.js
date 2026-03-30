import WatchHistory from "../models/watchHistory.model.js";
import Video from "../models/video.model.js";
export const computeRecommendations = async (userId) => {

  const history = await WatchHistory.find({ user: userId })
    .populate({
      path: "video",
      select: "category program subject duration"
    });

  if (history.length === 0) {
    return await Video.find()
      .sort({ views: -1, ratingAverage: -1 })
      .limit(10)
      .lean();
  }

  const subjectWeight = {};
  const programWeight = {};
  const categoryWeight = {};

  history.forEach(h => {

    const v = h.video;
    if (!v) return;

    const ratio = v.duration
      ? Math.min(h.watchedSeconds / v.duration, 1)
      : 0.5;

    const weight = ratio * 10;

    if (v.subject) subjectWeight[v.subject] = (subjectWeight[v.subject] || 0) + weight;
    if (v.program) programWeight[v.program] = (programWeight[v.program] || 0) + weight;
    if (v.category) categoryWeight[v.category] = (categoryWeight[v.category] || 0) + weight;

  });

  const watchedIds = history.map(h => h.video?._id);

  const videos = await Video.find({
    _id: { $nin: watchedIds }
  })
    .limit(100)
    .lean();

  return videos.slice(0, 10); // simplified (aggregation version later)
};