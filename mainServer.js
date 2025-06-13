require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const mandiRoutes = require("./routes/mandi");
const advisoryRoutes = require("./routes/advisory");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Optional: Secure CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Register routes
app.use("/api", mandiRoutes);
app.use("/api", advisoryRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Unified server running at http://localhost:${PORT}`);
});
