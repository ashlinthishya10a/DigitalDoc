import mongoose from "mongoose";
import { Enrollment } from "../models/Enrollment.js";
import { User } from "../models/User.js";

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Use a connection string that points to the digitalflow database.");
  }

  await mongoose.connect(mongoUri, {
    dbName: "digitalflow"
  });

  await Promise.all([Enrollment.syncIndexes(), User.syncIndexes()]);

  console.log("MongoDB connected to digitalflow");
};
