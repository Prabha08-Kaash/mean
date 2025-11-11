const express = require("express");
const  router = express.Router();
const {  getUser, getUserById ,updateUser, deleteUser } = require("../controllers/userController.js");
const multer = require("multer")
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware.js")



const upload = multer({dest: "uploads/"})


router.get("/", getUser);
router.get("/:id", getUserById);
router.patch("/:id",authMiddleware, upload.single("photo"), updateUser);
router.delete("/:id", deleteUser);

module.exports = router;