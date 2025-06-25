import express from "express";
import {
  getAllRoles,
  getSingleRole,
  createRole,
  deleteRole,
  updateRole,
} from "../../controllers/roleController.js";

import adminVerify from "../../middlewares/adminVerify.js";

const router = express.Router();

// Use token verification middleware
router.use(adminVerify);

// Define routes for roles
router.route("/").get(getAllRoles).post(createRole);
router.route("/:id").get(getSingleRole).delete(deleteRole).put(updateRole);

// Export the router
export default router;
