const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const newsRoutes = require('./routes/newsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable buffering so it fails immediately if DB is down
mongoose.set('bufferCommands', false);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/fake-news-detection";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use('/api/news', newsRoutes);

// Legacy routes or health check
app.get("/", (req, res) => {
  res.json({
    message: "Fake News Detection Production API",
    status: "running",
    version: "2.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
      Fake News Detection API Server v2  
      Server running on port ${PORT}           

  `);
});
