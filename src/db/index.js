import mongoose from "mongoose"
import logger from "../config/logger.js";

export const connectToDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}
