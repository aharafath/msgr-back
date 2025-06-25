import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { cloudDelete, cloudUpload } from "../utils/cloudinary.js";
import { findPublicIdWithFolder } from "../helpers/helpers.js";
import jwt from "jsonwebtoken";
import { isUserAvailableForDonation } from "../utils/utils.js";

/**
 * @DESC Get All User
 * @ROUTE /api/v1/user/all-users
 * @method GET
 * @access public
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");

  res.status(200).json(users);
});

/**
 * @DESC Get All Users with Efficient Filtering
 * @ROUTE /api/v1/user/all-users-for-blood
 * @method GET
 * @access public
 */
export const getAllUsersForBlood = asyncHandler(async (req, res) => {
  const { bloodGroup, division, district, upazila, available } = req.query;
  // Step 1: Build MongoDB filters (excluding availability)
  const mongoFilters = {};

  if (bloodGroup) mongoFilters.bloodGroup = bloodGroup;
  if (division) mongoFilters.division = division;
  if (district) mongoFilters.district = district;
  if (upazila) mongoFilters.upazila = upazila;

  // Step 2: Fetch filtered users from DB (much smaller result set)
  const users = await User.find(mongoFilters).select("-password");

  const filteredUsers = users
    .map((user) => {
      const availableForDonation = isUserAvailableForDonation(
        user.dob,
        user.lastDonation
      );

      return {
        ...user.toObject(),
        availableForDonation,
      };
    })
    .filter((user) => {
      if (available === "Available") return user.availableForDonation === true;
      if (available === "Not available")
        return user.availableForDonation === false;
      return true;
    });

  res.status(200).json(filteredUsers);
});

/**
 * @DESC Get Single User
 * @ROUTE /api/v1/user/:id
 * @method GET
 * @access public
 */
export const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select("-password")
    .populate("role")
    .lean();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const availableForDonation = isUserAvailableForDonation(
    user.dob,
    user.lastDonation
  );

  res.status(200).json({ ...user, availableForDonation });
  // res.status(200).json({ ...user, availableForDonation });
});

/**
 * @DESC Delete User
 * @ROUTE /api/v1/user/:id
 * @method DELETE
 * @access private
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Ensure the user can only delete their own account
  if (req.me._id.toString() !== id) {
    return res
      .status(403)
      .json({ message: "You can only delete your own account" });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.remove();

  res.status(200).json({ message: `${user.name} deleted successfully` });
});

/**
 * @DESC Update User
 * @ROUTE /api/v1/user/:id
 * @method PUT/PATCH
 * @access private
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Ensure the user can only update their own account
  if (req.me._id.toString() !== id) {
    return res
      .status(403)
      .json({ message: "You can only update your own account" });
  }

  const bodyData = req.body;

  const file = req.file;

  const user = await User.findById(id).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // If a file is uploaded, upload it to Cloudinary and update
  if (file) {
    try {
      // Upload new profile photo to Cloudinary
      const uploadedPhoto = await cloudUpload(file, "profile_photos");

      // Delete old profile photo from Cloudinary, if it exists
      if (user.profilePhoto) {
        await cloudDelete(findPublicIdWithFolder(user.profilePhoto));
      }

      // Update the user's profile photo with the new one
      user.profilePhoto = uploadedPhoto.url;
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      return res.status(500).json({ message: "Error uploading profile photo" });
    }
  }

  Object.assign(user, bodyData);

  // user.availableForDonation =
  //   bodyData.dob > "2007-01-01" && bodyData.lastDonation > "2025-3-1"
  //     ? true
  //     : false;

  await user.save();

  res.status(200).json({ message: "User updated successfully", user });
});

/**
 * @DESC Update User Email
 * @ROUTE /api/v1/user/:id/email
 * @method PUT
 * @access private
 */
export const updateUserEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, password } = req.body;

  // Ensure the user can only update their own email
  if (req.me._id.toString() !== id) {
    return res
      .status(403)
      .json({ message: "You can only update your own email" });
  }

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Password is incorrect" });
  }
  // Check if the new email is already in use
  const existingUser = await User.find({ email });
  if (existingUser.length > 0) {
    return res.status(400).json({ message: "Email is already in use" });
  }
  user.email = email;
  await user.save();

  // create access token
  const token = jwt.sign(
    { email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN,
    }
  );

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.APP_ENV == "Development" ? false : true,
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ message: "Email updated successfully", user });
});

/**
 * @DESC Update User Password
 * @ROUTE /api/v1/user/:id/password
 * @method PUT
 * @access private
 */
export const updateUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  // Ensure the user can only update their own password
  if (req.me._id.toString() !== id) {
    return res
      .status(403)
      .json({ message: "You can only update your own password" });
  }

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Old password and new password are required" });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Old password is incorrect" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res
    .status(200)
    .json({ message: "Password updated successfully", success: true });
});

/**
 * @DESC Update Profile Photo
 * @ROUTE /api/v1/user/:id/profile-photo
 * @method PUT
 * @access private
 */
export const updateProfilePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  // Ensure the user can only update their own profile photo
  if (req.me._id.toString() !== id) {
    return res
      .status(403)
      .json({ message: "You can only update your own profile photo" });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // If a file is uploaded, upload it to Cloudinary and update the user's profile photo
  if (file) {
    try {
      // Upload new profile photo to Cloudinary
      const uploadedPhoto = await cloudUpload(file, "profile_photos");

      // Delete old profile photo from Cloudinary, if it exists
      if (user.profilePhoto) {
        await cloudDelete(findPublicIdWithFolder(user.profilePhoto));
      }

      // Update the user's profile photo with the new one
      user.profilePhoto = uploadedPhoto.url;
      await user.save();

      return res.status(200).json({
        message: "Profile photo updated successfully",
        user,
      });
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      return res.status(500).json({ message: "Error uploading profile photo" });
    }
  }

  return res
    .status(400)
    .json({ message: "No profile photo provided to update" });
});
