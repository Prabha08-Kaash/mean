const User = require("../models/User.model.js");
const fs = require("fs")
const { uploadToCloudinary } = require("../utils/cloudinary.js")


//get all users
exports.getUser = async (req, res) => {
  try {
    const users = await User.find();

    if (!users) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while fetching users",
      error: error.message,
    });
  }
};


//get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error while fetching user",
      error: error.message,
    });
  }
};


//update users
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    //  Logged-in user (from middleware)
    const loggedInUser = req.user;
    if (!loggedInUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //Normal user update their own data
    if (loggedInUser.role !== "admin" && loggedInUser.id.toString() !== id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You Cannot update another user's profile" });
    }

    // Allowed fields
    const updates = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      location: req.body.location,
      state: req.body.state,
      city: req.body.city,
      pincode: req.body.pincode,
      bio: req.body.bio,
    };

    // only admin updating the role
    if (loggedInUser.role === "admin" && req.body.role) {
      updates.role = req.body.role;
    }

    //file upload logic

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path, "profile");
        updates.photo = result.secure_url;
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Error uploading to Cloudinary:", err);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }


  //update in DB
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

  // profile complete check
    const requiredFields =
     [
      updatedUser.name, 
      updatedUser.email,
      updatedUser.phone,
       updatedUser.location,
      updatedUser.state,
      updatedUser.city,
      updatedUser.pincode,
      ];
    const profileComplete = requiredFields.every(Boolean);

    if (profileComplete && !updatedUser.profileCompleted) {
      updatedUser.profileCompleted = true;
      await updatedUser.save();
    }

  

    res.json({
      message: "Profile updated successfully",
      data: updatedUser
    })
  } catch (error) {
    res.status(500).json({
      message: "Error while updating user",
      error: error.message
    });
  }
};


//delete user
exports.deleteUser = async (req, res) => {
  try {
  const { id } = req.params;
  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
   return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while deleting user",
      error: error.message,
    });
  }
}



