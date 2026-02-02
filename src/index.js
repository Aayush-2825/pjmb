import app from "./app.js";
import dotenv from "dotenv";
import { connectToDB } from "./db/index.js";
import logger from "./config/logger.js";
import fs from "fs";
import path from "path";

dotenv.config();

const PORT = process.env.PORT || "3000";

// Ensure logs directory exists
const logsDir = process.env.LOG_FILE_PATH || './logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

connectToDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API Base URL: ${process.env.APP_ORIGIN || `http://localhost:${PORT}`}`);
    });
  })
  .catch((err) => {
    logger.error("❌ Database connection failed:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
