import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";
import "./jobs/task.jobs";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 7070;
const HOST = "0.0.0.0";
const MONGOURI = process.env.MONGO_URI;

if (!MONGOURI) {
  throw new Error("MONGOURI environment variable is not defined");
}

const connectWithRetry = async () => {
  try {
    await mongoose.connect(MONGOURI, {
      dbName: "cosmos_core",
    });
    console.log("Connected DB:", mongoose.connection.name);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    setTimeout(connectWithRetry, 5000);
  }
};

const startServer = async () => {
  await connectWithRetry();
  app.listen(PORT, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });
};

startServer();
