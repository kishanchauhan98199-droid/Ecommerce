const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/nexmart")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Test Route
app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

// Start Server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});