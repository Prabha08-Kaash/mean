const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model.js");

// ✅ SIGNUP (Register)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists. Please log in instead."
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // ✅ generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "10d" }
    );

    res.cookie("token", token, {
      httpOnly: true,                // Frontend JavaScript se access nahi kar sakta
      secure: process.env.NODE_ENV === "production", // only HTTPS in production
      sameSite: "Strict",            // CSRF protection
      maxAge: 10 * 24 * 60 * 60 * 1000 // 10 days
    });

    // send response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          photo: user.photo,
          phone: user.phone,
          location: user.location,
          state: user.state,
          city: user.city,
          pincode: user.pincode,
          bio: user.bio,
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ✅ LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "User not found, Please sign up!! " });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid Credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "10d" }
    );

    // ✅ Send token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 10 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          photo: user.photo,
          phone: user.phone,
          location: user.location,
          state: user.state,
          city: user.city,
          pincode: user.pincode,
          bio: user.bio,
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// ✅ CHECK AUTH (for cookie-based login verification)
exports.checkAuth = async (req, res) => {
  try {
    const user = req.user; // comes from middleware
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// ✅ CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // we’ll get this from the JWT token (middleware)
    const { currentPassword, newPassword } = req.body;

    // 1️⃣ Find user from DB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2️⃣ Compare old password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password is incorrect" });
    }

    // 3️⃣ Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 4️⃣ Save new password
    user.password = hashedNewPassword;
    await user.save();

    // 5️⃣ Send success response
    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }

};

