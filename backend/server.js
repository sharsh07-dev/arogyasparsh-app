const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db"); // removed .js extension (standard practice)

// Import Routes
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const phcInventoryRoutes = require("./routes/phcInventoryRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const hospitalInventoryRoutes = require("./routes/hospitalInventoryRoutes");
dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Test Route
app.get("/", (req, res) => {
  res.send("API is running... ArogyaSparsh Server is Online! 🚁");
});

// ✅ Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/phc-inventory", phcInventoryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/hospital-inventory", hospitalInventoryRoutes);
const PORT = process.env.PORT || 5000; // Standard port is often 5000 or 8000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});