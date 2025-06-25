import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { cloudDelete, cloudUpload } from "../utils/cloudinary.js";
import { findPublicIdWithFolder } from "../helpers/helpers.js";

/**
 * @DESC Get all users
 * @ROUTE /api/v1/user
 * @method GET
 * @access public
 */
export const getAllUser = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").populate("role");

  if (users.length > 0) {
    res.status(200).json(users);
  } else {
    res.status(404).json({ message: "No users found" });
  }
});

/**
 * @DESC Get Single User
 * @ROUTE /api/v1/user/:id
 * @method GET
 * @access public
 */
export const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password").populate("role");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(user);
});

/**
 * @DESC Create New User
 * @ROUTE /api/v1/user
 * @method POST
 * @access public
 */
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Name, Email, Password, and Role are required" });
  }

  // Check if email already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: "Email already exists" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  res.status(201).json({ user, message: `${name} created successfully` });
});

/**
 * @DESC Delete User
 * @ROUTE /api/v1/user/:id
 * @method DELETE
 * @access public
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ message: `${user.name} deleted successfully` });
});

/**
 * @DESC Update User
 * @ROUTE /api/v1/user/:id
 * @method PUT/PATCH
 * @access public
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { name, email, role, isVerified, newPassword } = req.body;

  // Fetch the user by ID
  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // If a new password is provided, hash it and update
  if (newPassword) {
    user.password = await bcrypt.hash(newPassword, 10);
  }

  // Update other fields
  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;
  user.isVerified = isVerified !== undefined ? isVerified : user.isVerified;

  // Save updated user
  const updatedUser = await user.save();

  res
    .status(200)
    .json({ message: "User updated successfully", user: updatedUser });
});

/**
 * @DESC Update Profile Photo with Upload
 * @ROUTE /api/v1/user/profile-photo/:id
 * @method PUT
 * @access private
 */
export const updateProfilePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Upload new photo to Cloudinary
  const uploadedPhoto = await cloudUpload(file, "profile_photos");

  // Delete old profile photo from Cloudinary, if it exists
  if (user.profilePhoto) {
    await cloudDelete(findPublicIdWithFolder(user.profilePhoto));
  }

  // Update user's profile photo
  user.profilePhoto = uploadedPhoto.url;

  await user.save();

  res.status(200).json({
    message: "Profile photo updated successfully",
    user,
  });
});
