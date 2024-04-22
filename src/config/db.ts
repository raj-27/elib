import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
  try {
    // First we have to register  listener before connected to database
    mongoose.connection.on("connected", () => {
      console.log("Cnnected to database successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.log("Error in connecting in database", err);
    });

    await mongoose.connect(config.databaseUrl as string); // Connecting to Database
  } catch (error) {
    console.error("Failed to connect to database", error);
    process.exit(1);
  }
};

export default connectDB;
