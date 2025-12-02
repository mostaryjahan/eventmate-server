import express from "express";
import { UserController } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";
import { multerUpload } from "../../../config/multer.config";
import { parseFormData } from "../../middlewares/parseFormData";

const router = express.Router();

router.post("/register", multerUpload.single("profile"), parseFormData, validateRequest(createUserZodSchema), UserController.createUser);

export const userRoutes = router;