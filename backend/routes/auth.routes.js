import express from "express";
import protectRoute from '../middleware/protectRoute.js';

import {forgetPassword, login, logout, resetPassword, signup, updateProfile } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup",signup);

router.post("/login", login);

router.post("/forgetPassword",forgetPassword);

router.post("/resetPassword",resetPassword);

router.put("/updateProfile", protectRoute, updateProfile);

router.post("/logout",logout);


export default router;