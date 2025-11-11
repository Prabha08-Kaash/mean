const express = require("express");
const  router = express.Router();
const { register, login, logout, checkAuth, changePassword  } = require("../controllers/authController.js");
const {authMiddleware} = require("../middlewares/authMiddleware.js");

router.post("/signup", register);
router.post("/login", login);
router.post("/logout", logout);

router.post("/change-password", authMiddleware, changePassword);

// ✅ New route to verify cookie-based login
router.get("/check-auth", authMiddleware, checkAuth);
module.exports = router;