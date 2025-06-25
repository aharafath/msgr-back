import express from "express";
import {
  deleteUser,
  getSingleUser,
  updateProfilePhoto,
  updateUser,
  updateUserPassword,
  getAllUsers,
  updateUserEmail,
  getAllUsersForBlood,
} from "../../controllers/singleUserController.js";
import tokenVerify from "../../middlewares/verifyToken.js";
import { profilePhoto } from "../../utils/multer.js";

const router = express.Router();

//get all users
router.get("/all-users", getAllUsers);

// use verify token
router.use(tokenVerify);

// create route

router
  .route("/:id")
  .get(getSingleUser)
  .delete(deleteUser)
  .put(profilePhoto, updateUser);
// add multer for profile photo and cover photo update
router.put("/change-password/:id", updateUserPassword);
router.put("/change-email/:id", updateUserEmail);
router.put("/profile-photo/:id", profilePhoto, updateProfilePhoto);
router.get("/get-all-users/for-blood", getAllUsersForBlood);

// export default router
export default router;
