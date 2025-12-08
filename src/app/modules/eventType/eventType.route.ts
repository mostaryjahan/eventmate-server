import express from "express";
import { UserRole } from "@prisma/client";
import checkAuth from "../../middlewares/checkAuth";
import { EventTypeController } from "./eventType.controller";

const router = express.Router();

router.post(
  "/",
  checkAuth(UserRole.ADMIN),
  EventTypeController.createType
);

router.get("/", EventTypeController.getAllTypes);

router.put(
  "/:id",
  checkAuth(UserRole.ADMIN),
  EventTypeController.updateType
);
router.delete("/:id", checkAuth(UserRole.ADMIN), EventTypeController.deleteType);

export const eventTypeRoutes = router;