import express from "express";
import { FriendController } from "./friend.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/request",
  checkAuth(UserRole.ADMIN, UserRole.HOST, UserRole.USER),
  FriendController.sendFriendRequest
);
router.post(
  "/accept",
  checkAuth(UserRole.ADMIN, UserRole.HOST, UserRole.USER),
  FriendController.acceptFriendRequest
);
router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.HOST, UserRole.USER),
  FriendController.getFriends
);
router.get(
  "/requests",
  checkAuth(UserRole.ADMIN, UserRole.HOST, UserRole.USER),
  FriendController.getSentFriendRequests
);
router.get(
  "/events",
  checkAuth(UserRole.ADMIN, UserRole.HOST, UserRole.USER),
  FriendController.getFriendsEvents
);
router.get(
  "/:friendId/events",
  checkAuth(UserRole.ADMIN, UserRole.HOST, UserRole.USER),
  FriendController.getFriendParticipatedEvents
);
router.delete(
  "/:friendId",
  checkAuth(UserRole.ADMIN, UserRole.HOST, UserRole.USER),
  FriendController.removeFriend
);

export const friendRoutes = router;
