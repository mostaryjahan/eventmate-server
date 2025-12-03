import express from "express";
import { AdminController } from "./admin.controller";
import  checkAuth  from "../../middlewares/checkAuth";

const router = express.Router();

router.get("/dashboard", checkAuth("ADMIN"), AdminController.getDashboardStats);
router.put("/users/:userId", checkAuth("ADMIN"), AdminController.manageUser);
router.put("/events/:eventId", checkAuth("ADMIN"), AdminController.moderateEvent);

export const adminRoutes = router;