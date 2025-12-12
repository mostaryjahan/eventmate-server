import express from "express";
import { EventController } from "./event.controller";
import { multerUpload } from "../../../config/multer.config";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { PaymentController } from "../payment/payment.controller";

const router = express.Router();

router.post(
  "/",
  checkAuth(UserRole.HOST),
  multerUpload.single("image"),
  EventController.createEvent
);

router.get("/", EventController.getAllEvents);
// for host
router.get("/my-events", checkAuth(UserRole.HOST), EventController.getMyHostedEvents);
// for user
router.get("/my-event", checkAuth(), EventController.getMyJoinedEvents);
router.get("/:id", EventController.getEventById);

router.patch(
  "/:id",
  checkAuth(),
  multerUpload.single("image"),
  EventController.updateEvent
);
router.delete("/:id", checkAuth(), EventController.deleteEvent);

// Event participation routes
router.get("/:id/participants", EventController.getParticipants);
router.post("/:id/join", checkAuth(), EventController.joinEvent);
router.delete("/:id/leave", checkAuth(), EventController.leaveEvent);

// Payment route
router.post("/:id/initiate-payment", checkAuth(), PaymentController.createPaymentSession);

export const eventRoutes = router;
