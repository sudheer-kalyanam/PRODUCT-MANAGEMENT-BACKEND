const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const cors = require("cors");

dotenv.config();
connectDB();

const allowedOrigins = ["http://localhost:5173"];

const productRoutes = require("./src/routes/prouductRoutes.js");

const app = express();
app.use(express.json());
app.use(cors({
  origin: allowedOrigins,
  credentials: true, // IMPORTANT: allow cookies
}));

app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
