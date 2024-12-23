
import express from "express";
import {
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
} from "../controllers/users.controller.js";
import authenticateUser from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refreshtoken", refreshToken);
router.get("/auth", authenticateUser);

export default router;
