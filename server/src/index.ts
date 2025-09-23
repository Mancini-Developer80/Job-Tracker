import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes";
import jobRoutes from "./routes/jobRoutes";
import jobStatsRoutes from "./routes/jobStatsRoutes";
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend dev server
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running!");
});

app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/jobs", jobStatsRoutes);

app.use("/api/auth", authRoutes);

// Centralized error handler (should be last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));
