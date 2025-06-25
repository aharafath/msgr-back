import asyncHandler from "express-async-handler";
import tokenVerify from "./verifyToken.js";

const adminVerify = asyncHandler(async (req, res, next) => {
  // First, verify if the user is logged in
  await tokenVerify(req, res, () => {
    const userRole = req.me?.role; // `role` is populated in the tokenVerify middleware

    // Check if the user's role is Admin
    if (!userRole || userRole.name !== "Admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    // If the user is an admin, proceed
    next();
  });
});

export default adminVerify;
