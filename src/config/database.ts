import mongoose from "mongoose";
import logger from "./logger";

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      logger.error("MongoDB URI is not defined");
      throw new Error("MongoDB URI is not defined");
    }

    await mongoose.connect(mongoUri);

    logger.info("MongoDB connected successfully");

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });
  } catch (error: any) {
    logger.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};
