const jwt = require("jsonwebtoken");

const User = require("../models/User.model");

exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token; // ✅ safe optional chaining

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    // ✅ Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // ✅ Fetch user from DB (optional but safer)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or deleted",
      });
    }

    req.user = user; // attach full user info
    next(); // ✅ important

  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


// ✅ Role-based access
exports.adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin only" });
  }
  next();
};
