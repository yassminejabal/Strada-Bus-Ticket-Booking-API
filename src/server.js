import app from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(
      "mongodb://127.0.0.1:27017/strada?directConnection=true",
    );
    console.log("Connected to MongoDB successfully! ");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();
