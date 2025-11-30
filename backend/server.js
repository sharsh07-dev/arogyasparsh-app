const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes"); // <--- 1. IMPORT THIS
const phcInventoryRoutes = require("./routes/phcInventoryRoutes");
dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors({
  origin: "*", // Allow all origins (Critical for testing Vercel -> Render)
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("API is running... ArogyaSparsh Server is Online! 🚁");
});

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes); // <--- 2. USE THIS
app.use("/api/phc-inventory", phcInventoryRoutes);
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});