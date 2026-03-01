import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log(`✅ PostgreSQL Connected Successfully !! DB HOST: ${process.env.DB_HOST}`);
    client.release();
  } catch (error) {
    console.error("❌ PostgreSQL Connection Failed:", error);
    process.exit(1);
  }
};

export default pool;