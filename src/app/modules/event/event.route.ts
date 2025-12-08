import express from "express";
import { EventController } from "./event.controller";
import { multerUpload } from "../../../config/multer.config";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
  checkAuth(UserRole.HOST),
  multerUpload.single("image"),
  EventController.createEvent
);

router.get("/", EventController.getAllEvents);
router.get("/my-events", checkAuth(UserRole.HOST), EventController.getMyHostedEvents);
router.get("/:id", EventController.getEventById);

router.put(
  "/:id",
  checkAuth(UserRole.HOST || UserRole.ADMIN),
  multerUpload.single("image"),
  EventController.updateEvent
);
router.delete("/:id", checkAuth(UserRole.HOST || UserRole.ADMIN), EventController.deleteEvent);

// Event participation routes
router.post("/:id/join", checkAuth(), EventController.joinEvent);
router.delete("/:id/leave", checkAuth(), EventController.leaveEvent);

export const eventRoutes = router;
