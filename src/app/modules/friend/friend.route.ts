import express from "express";
import { FriendController } from "./friend.controller";
import  checkAuth  from "../../middlewares/checkAuth";

const router = express.Router();

router.post("/request", checkAuth(), FriendController.sendFriendRequest);
router.put("/accept/:friendId", checkAuth(), FriendController.acceptFriendRequest);
router.get("/", checkAuth(), FriendController.getFriends);
router.get("/requests", checkAuth(), FriendController.getFriendRequests);
router.get("/events", checkAuth(), FriendController.getFriendsEvents);
router.delete("/:friendId", checkAuth(), FriendController.removeFriend);

export const friendRoutes = router;