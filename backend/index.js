process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

//import routes 
const userRoutes = require("./routes/userRoutes.js")
const itemRoutes = require("./routes/itemRoutes.js")
const categoryRoutes = require("./routes/categoryRoutes.js")
const authRoutes = require("./routes/authRoutes.js")
const locationRoutes = require("./routes/locationRoutes");
const rentRequestsRoutes = require("./routes/rentRequestsRoutes.js")
const proofRoutes = require("./routes/proofRoutes.js")


// Middleware
app.use(cookieParser()); // ✅ Add this line
app.use(express.json());
app.use(cors({
     origin: [
      "http://localhost:4200",
      "https://mean-frontend-409n.onrender.com",
     ],
  credentials: true
}));
  

// Connect DB
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/india", locationRoutes);
app.use("/api/rent-requests", rentRequestsRoutes);
app.use("/api/proof", proofRoutes);




// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


