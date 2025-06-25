import express from "express";
import { login, logout, register } from "../controllers/authController.js";

const router = express.Router();

// create route
router.route("/login").post(login);
router.route("/logout").post(logout);

router.route("/register").post(register);

// export default router
export default router;
