import express from "express";
import {
  createUser,
  deleteUser,
  getAllUser,
  getSingleUser,
  updateUser,
  updateProfilePhoto,
} from "../../controllers/userController.js";
import adminVerify from "../../middlewares/adminVerify.js";
import { profilePhoto } from "../../utils/multer.js";

const router = express.Router();

// use verify token
router.use(adminVerify);

// create route
router.route("/").get(getAllUser).post(createUser);
router.route("/:id").get(getSingleUser).delete(deleteUser).put(updateUser);

// add multer for profile photo and cover photo update
router.put("/profile-photo/:id", profilePhoto, updateProfilePhoto);

// export default router
export default router;
