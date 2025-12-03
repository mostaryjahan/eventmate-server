import express from "express";
import { UserController } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { updateUserZodSchema } from "./user.validation";

import { parseFormData } from "../../middlewares/parseFormData";
import { UserRole } from "@prisma/client";
import checkAuth from "../../middlewares/checkAuth";

const router = express.Router();

router.get("/", checkAuth(UserRole.ADMIN), UserController.getAllUsers);

router.get("/:id", UserController.getUserById);


router.patch("/:id",parseFormData, validateRequest(updateUserZodSchema), UserController.updateUser);

export const userRoutes = router;