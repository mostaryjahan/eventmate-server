import express from "express";
import { AuthController } from "./auth.controller";

import { UserRole } from "@prisma/client";
import { UserController } from "../user/user.controller";
import { multerUpload } from "../../../config/multer.config";
import { parseFormData } from "../../middlewares/parseFormData";
import validateRequest from "../../middlewares/validateRequest";
import { createUserZodSchema } from "../user/user.validation";
import checkAuth from "../../middlewares/checkAuth";


const router = express.Router();

router.get("/me", AuthController.getMe);

router.post(
  "/register",
  multerUpload.single("profile"),
  parseFormData,
  validateRequest(createUserZodSchema),
  UserController.createUser
);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

router.post("/refresh-token", AuthController.refreshToken);

router.post(
  "/change-password",
  checkAuth(UserRole.ADMIN, UserRole.HOST, UserRole.USER),
  AuthController.changePassword
);

// router.post(
//     '/forgot-password',
//     AuthController.forgotPassword
// );

export const authRoutes = router;
