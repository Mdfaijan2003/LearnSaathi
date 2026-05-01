import axios from "axios";

/* -------------------- FETCH YOUTUBE DATA -------------------- */

export const getYouTubeVideoDetails = async (videoId) => {

  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    throw new Error("YouTube API key missing");
  }

  const url = "https://www.googleapis.com/youtube/v3/videos";

  const response = await axios.get(url, {
    params: {
      part: "snippet,contentDetails",
      id: videoId,
      key: API_KEY
    }
  });

  const item = response.data.items?.[0];

  if (!item) {
    throw new Error("YouTube video not found");
  }

  return {
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.high?.url,
    duration: item.contentDetails.duration
  };
};

/* -------------------- PARSE ISO DURATION -------------------- */

export const parseDuration = (iso) => {

  const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  return hours * 3600 + minutes * 60 + seconds;
};