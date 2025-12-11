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

// Specific routes first (before dynamic routes)
router.patch("/update-my-profile", checkAuth(UserRole.USER, UserRole.HOST, UserRole.ADMIN), multerUpload.single('file'), parseFormData, UserController.updateMyProfile);
router.patch("/update-role/:id", checkAuth(UserRole.ADMIN), parseFormData, UserController.updateRole);
router.post("/apply-for-host", checkAuth(UserRole.USER), UserController.applyForHost);
router.get("/host-application-status", checkAuth(UserRole.USER), UserController.checkHostApplicationStatus);
router.delete("/cancel-host-application", checkAuth(UserRole.USER), UserController.cancelHostApplication);

// Admin routes for host applications
router.get("/admin/host-applications", checkAuth(UserRole.ADMIN), UserController.getAllHostApplications);
router.patch("/admin/host-applications/:userId/approve", checkAuth(UserRole.ADMIN), UserController.approveHostApplication);
router.patch("/admin/host-applications/:userId/reject", checkAuth(UserRole.ADMIN), UserController.rejectHostApplication);

// Saved events routes
router.post("/save-event", checkAuth(UserRole.USER, UserRole.HOST), UserController.saveEvent);
router.delete("/unsave-event/:eventId", checkAuth(UserRole.USER, UserRole.HOST), UserController.unsaveEvent);
router.get("/saved-events", checkAuth(UserRole.USER, UserRole.HOST), UserController.getSavedEvents);
router.get("/check-saved/:eventId", checkAuth(UserRole.USER, UserRole.HOST), UserController.checkEventSaved);

// Dynamic routes last
router.get("/:id", UserController.getUserById);
router.patch("/:id",parseFormData, validateRequest(updateUserZodSchema), UserController.updateUser);
router.delete("/:id", checkAuth(UserRole.ADMIN), UserController.deleteUser);

export const userRoutes = router;