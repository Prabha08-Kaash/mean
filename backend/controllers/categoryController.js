const Category = require("../models/Category.model.js");
const Item = require("../models/Item.model.js"); // ✅ import Item model

//create category
exports.addCategory = async (req, res) => {
    try {
        const { name, description, icon } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const newCategory = new Category({ name, description, icon })
        await newCategory.save();

        res.status(201).json({
            message: "Category created successfully",
            data: newCategory,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error while creating the category",
            error: error.message
        });
    }
};


//get category
exports.getCategory = async (req, res) => {
    try {
        const categories = await Category.find();

        if (!categories) {
            res.status(404).json({ message: "No categories found" })
        }

        res.json({
            message: "categories found",
            data: categories
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching categories",
             error: error.message 
            });
    }
};


//get single category
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            res.status(404).json({ message: "category not found" });
        }

        res.json({
            message: "category found successfully",
            data: category,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching category",
            error: error.message,
        });
    }
};


//update category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({
            message: "Category updated successfully",
            data: updatedCategory,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error while updating the category",
            error: error.message,
        });
    }
};


//delete Categories
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

       // Delete the category
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Delete all items of this category
        await Item.deleteMany({ category: id });

        res.status(200).json({
            message: "Category and all related items deleted successfully",
            data: deletedCategory
        });
    } catch (error) {
        res.status(500).json({
            message: "Error while deleting the category",
            error: error.message,
        });
    }
};




