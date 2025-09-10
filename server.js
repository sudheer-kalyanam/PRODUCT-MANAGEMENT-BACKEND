const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("../src/config/db.js");
const cors = require("cors");

dotenv.config();
connectDB();

const allowedOrigins = [process.env.FRONTEND_URL || '*'];

const productRoutes = require("../src/routes/prouductRoutes.js");

const app = express();
app.use(express.json());
app.use(cors({
  origin: allowedOrigins,
  credentials: true, // IMPORTANT: allow cookies
}));

app.use("/products", productRoutes);

module.exports = app;
