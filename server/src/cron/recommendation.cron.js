import cron from "node-cron";
import { redisClient}  from "../utils/redis.js";
import { computeRecommendations } from "../services/recommendation.service.js";
import User from "../models/user.model.js";

export const startRecommendationCron = () => {

  cron.schedule("*/15 * * * *", async () => {
    console.log("Running recommendation cron...");

    const users = await User.find().select("_id").lean();

    for (const user of users) {

      const userId = user._id.toString();

      const recommendations = await computeRecommendations(userId);

      await redisClient.setEx(
        `recommendations:${userId}`,
        60 * 60, // ⏱ 1 hour
        JSON.stringify(recommendations)
      );
    }

    console.log("Recommendation cache updated");
  });
};