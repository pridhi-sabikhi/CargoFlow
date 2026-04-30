import express from "express";
import { forgotPassword, resetPassword, signIn, signUp, getMe } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/register", signUp);   // alias for frontend compatibility
router.post("/signin", signIn);
router.post("/login", signIn);      // alias for frontend compatibility
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", getMe);

export default router;
