import express from "express";
import { UserController } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { updateUserZodSchema } from "./user.validation";

import { parseFormData } from "../../middlewares/parseFormData";
import { UserRole } from "@prisma/client";
import checkAuth from "../../middlewares/checkAuth";
import { multerUpload } from "../../../config/multer.config";

const router = express.Router();

router.get("/", checkAuth(UserRole.ADMIN), UserController.getAllUsers);

router.get("/:id", UserController.getUserById);

router.patch("/update-my-profile", checkAuth(UserRole.USER, UserRole.HOST, UserRole.ADMIN), multerUpload.single('file'), parseFormData, UserController.updateMyProfile);

router.patch("/:id",parseFormData, validateRequest(updateUserZodSchema), UserController.updateUser);


router.patch("/update-role/:id", checkAuth(UserRole.ADMIN), parseFormData, UserController.updateRole);

router.delete("/:id", checkAuth(UserRole.ADMIN), UserController.deleteUser);

router.post("/apply-for-host", checkAuth(UserRole.USER), UserController.applyForHost);

// Admin routes for host applications
router.get("/admin/host-applications", checkAuth(UserRole.ADMIN), UserController.getAllHostApplications);
router.patch("/admin/host-applications/:userId/approve", checkAuth(UserRole.ADMIN), UserController.approveHostApplication);
router.patch("/admin/host-applications/:userId/reject", checkAuth(UserRole.ADMIN), UserController.rejectHostApplication);

// Saved events routes
router.post("/save-event", checkAuth(UserRole.USER, UserRole.HOST), UserController.saveEvent);
router.delete("/unsave-event/:eventId", checkAuth(UserRole.USER, UserRole.HOST), UserController.unsaveEvent);
router.get("/saved-events", checkAuth(UserRole.USER, UserRole.HOST), UserController.getSavedEvents);
router.get("/check-saved/:eventId", checkAuth(UserRole.USER, UserRole.HOST), UserController.checkEventSaved);

export const userRoutes = router;