const fs = require("fs")
const Item = require("../models/Item.model.js");
const Category = require("../models/Category.model.js")
const User = require("../models/User.model.js")
const { uploadToCloudinary } = require("../utils/cloudinary.js")
const RentRequest = require("../models/RentRequest.model.js")

//create new item
exports.addItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      unit,
      photo,
      owner,
      itemCondition,
      additionalDetails
    } = req.body;

    const loggedInUser = req.user;
    if (!loggedInUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }


    // Validate Category and Owner exist
    const [categoryExist, ownerExist] = await Promise.all([
      Category.findById(category),
      User.findById(owner)
    ]);

    if (!categoryExist && !ownerExist) {
      return res.status(500).json({ message: "category and owner do not exist" })
    } else if (!categoryExist) {
      return res.status(500).json({ message: "category does not exist" })
    } else if (!ownerExist) {
      return res.status(500).json({ message: "owner does not exist" })
    }

    // ✅ Check if owner's profile is complete
    if (!ownerExist.profileCompleted) {
      return res.status(403).json({
        message: "Please complete your profile before adding an item."
      });
    }

    //file upload part
    let imageUrl = null;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path, "item");
        imageUrl = result.secure_url;
        fs.unlinkSync(req.file.path); // delete local temp file
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    const newItem = new Item({
      title,
      description,
      category,
      price,
      unit,
      photo,
      owner,
      itemCondition,
      additionalDetails
    });

    if (imageUrl) {
      newItem.photo = imageUrl;
    }

    await newItem.save();
    await newItem.populate("category owner");

    res.status(201).json({
      message: "Item created successfully",
      data: newItem
    })
  } catch (error) {
    console.error("Add Item Error:", error);
    res.status(500).json({
      message: "Error while creating item",
      error: error.message
    });
  }
};


// GET items 
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find()
      .sort({ createdAt: -1 })
      .populate("category")
      .populate("owner");

    res.json({
      message: "Items fetched successfully",
      data: items,
      totalItems: items.length
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching items",
      error: error.message
    });
  }
};


//get single item
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("category")
      .populate("owner");

    if (!item)
      return res.status(404).json({ message: "Item Not Found" });

    res.status(200).json({
      message: "Item Found successfully",
      data: item
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching item",
      error: error.message
    });
  }
};


exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      unit,
      category,
      owner,
      itemCondition,
      additionalDetails
    } = req.body;

    // Validate category and owner exist
    const [categoryExist, ownerExist] = await Promise.all([
      Category.findById(category),
      User.findById(owner)
    ]);

    if (!categoryExist && !ownerExist) {
      return res.status(400).json({ message: "Category and owner do not exist" });
    } else if (!categoryExist) {
      return res.status(400).json({ message: "Category does not exist" });
    } else if (!ownerExist) {
      return res.status(400).json({ message: "Owner does not exist" });
    }

    // Handle file upload
    let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, "item");
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    // Prepare updates
    const updates = {
      title,
      description,
      price,
      unit,
      category,
      owner,
      itemCondition,
      additionalDetails
    };

    if (imageUrl) updates.photo = imageUrl;

    // Update DB
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("category owner");

    if (!updatedItem)
      return res.status(404).json({ message: "Item not found" });


    res.json({
      message: "Item updated successfully",
      data: updatedItem
    });
  } catch (error) {
    console.error("Update Item Error:", error);
    res.status(500).json({
      message: "Error while updating the item",
      error: error.message
    });
  }
};


//delete item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem)
      return res.status(404).json({ message: "Item not found" });

    // Delete all rent requests related to this item
    await RentRequest.deleteMany({ itemId: id });

    res.json({
      message: "Item deleted successfully",
      data: deletedItem
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while deleting the item",
      error: error.message
    });
  }
};


// search items
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.searchItems = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const safe = escapeRegex(q.toLowerCase());

    // Map of state codes to full names
    const stateMap = {
      AP: "Andhra Pradesh", AR: "Arunachal Pradesh", AS: "Assam",
      BR: "Bihar", CG: "Chhattisgarh", DL: "Delhi", GA: "Goa",
      GJ: "Gujarat", HR: "Haryana", HP: "Himachal Pradesh",
      JH: "Jharkhand", JK: "Jammu and Kashmir", KA: "Karnataka",
      KL: "Kerala", MP: "Madhya Pradesh", MH: "Maharashtra",
      MN: "Manipur", ML: "Meghalaya", MZ: "Mizoram", NL: "Nagaland",
      OD: "Odisha", PB: "Punjab", RJ: "Rajasthan", SK: "Sikkim",
      TN: "Tamil Nadu", TS: "Telangana", TR: "Tripura", UP: "Uttar Pradesh",
      UK: "Uttarakhand", WB: "West Bengal"
    };

    // Detect if user searched a state code/full name
    let stateCode = null;
    for (const [code, name] of Object.entries(stateMap)) {
      if (
        q.toLowerCase() === code.toLowerCase() ||
        q.toLowerCase() === name.toLowerCase()
      ) {
        stateCode = code;
        break;
      }
    }

    const matchConditions = [];

    if (q) {
      const orConditions = [
        { title: { $regex: safe, $options: 'i' } },
        { description: { $regex: safe, $options: 'i' } },
        { 'owner.city': { $regex: safe, $options: 'i' } },
        { 'owner.location': { $regex: safe, $options: 'i' } },
      ];

      if (stateCode) {
        orConditions.push({ 'owner.state': stateCode });
      } else {
        orConditions.push({ 'owner.state': { $regex: safe, $options: 'i' } });
      }
      matchConditions.push({ $or: orConditions });
    }

    const matchStage = matchConditions.length > 0 ? { $and: matchConditions } : {};

    // Aggregation pipeline
    const pipeline = [
      {
        $lookup:
        {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner'
        },
      },
      { $unwind: '$owner' },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $match: matchStage },
      {
        $project: {
          title: 1,
          description: 1,
          price: 1,
          unit: 1,
          photo: 1,
          'category._id': 1,
          'category.name': 1,
          'owner._id': 1,
          'owner.name': 1,
          'owner.city': 1,
          'owner.state': 1,
          'owner.location': 1,
          'owner.photo': 1
        },
      },
    ];

    const items = await Item.aggregate(pipeline);

    res.json({
      message: "Search successful",
      total: items.length,
      data: items
    });
  } catch (error) {
    console.error("Search failed:", error);
    res.status(500).json({
      message: "Error performing search",
      error: error.message,
    });
  }
};
