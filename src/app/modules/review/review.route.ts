import express from "express";
import { ReviewController } from "./review.controller";
import  checkAuth  from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post("/", checkAuth(UserRole.USER, UserRole.ADMIN, UserRole.HOST), ReviewController.createReview);
router.get("/", ReviewController.getAllReviews);
router.get("/host/:hostId", ReviewController.getHostReviews);
router.get("/event/:eventId", ReviewController.getEventReviews);
router.put("/:id", checkAuth(UserRole.USER, UserRole.ADMIN), ReviewController.updateReview);
router.delete("/:id", checkAuth(UserRole.USER, UserRole.ADMIN), ReviewController.deleteReview);

export const reviewRoutes = router;