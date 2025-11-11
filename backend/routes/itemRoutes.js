const express = require("express");
const router = express.Router();
const { addItem, getItems, getItemById, updateItem, deleteItem, searchItems, } = require("../controllers/itemController.js")
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware.js")

const multer = require("multer")

const upload = multer({ dest: "uploads/" })

router.get('/search', searchItems);
router.get('/', getItems);
router.get("/:id", authMiddleware, getItemById);

// protected routes
router.post("/", authMiddleware, upload.single("photo"), addItem);
router.patch("/:id", authMiddleware, upload.single("photo"), updateItem);
router.delete("/:id", authMiddleware, deleteItem);

module.exports = router;