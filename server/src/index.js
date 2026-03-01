import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./db/db.js";

dotenv.config({
    path: './.env'
});

const startServer = async () => {
  try {
   await connectDB();  // WAIT for DB

    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();