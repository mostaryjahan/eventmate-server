import express from "express";
import { ReviewController } from "./review.controller";
import  checkAuth  from "../../middlewares/checkAuth";

const router = express.Router();

router.post("/", checkAuth(), ReviewController.createReview);
router.get("/host/:hostId", ReviewController.getHostReviews);
router.get("/event/:eventId", ReviewController.getEventReviews);
router.put("/:id", checkAuth(), ReviewController.updateReview);
router.delete("/:id", checkAuth(), ReviewController.deleteReview);

export const reviewRoutes = router;