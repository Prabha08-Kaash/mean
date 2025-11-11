const express = require("express")
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware.js")
const {addCategory, getCategory, getCategoryById, updateCategory, deleteCategory} = require("../controllers/categoryController.js")

router.post("/", adminMiddleware, addCategory);
router.get("/", getCategory);
router.get("/:id",getCategoryById);
router.patch("/:id",adminMiddleware, updateCategory);
router.delete('/:id',adminMiddleware, deleteCategory )


module.exports = router