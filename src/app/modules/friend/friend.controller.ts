import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { FriendService } from "./friend.service";
import httpStatus from "http-status-codes";

const sendFriendRequest = catchAsync(async (req: Request, res: Response) => {
  const { friendId } = req.body;
  const result = await FriendService.sendFriendRequest(req.user.id, friendId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Friend request sent successfully",
    data: result,
  });
});

const acceptFriendRequest = catchAsync(async (req: Request, res: Response) => {
  const { friendId } = req.body;
  console.log("[acceptFriendRequest] userId:", req.user.id, "friendId:", friendId);
  const result = await FriendService.acceptFriendRequest(req.user.id, friendId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Friend request accepted",
    data: result,
  });
});

const getFriends = catchAsync(async (req: Request, res: Response) => {
  const result = await FriendService.getFriends(req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Friends retrieved successfully",
    data: result,
  });
});

const getFriendRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await FriendService.getFriendRequests(req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Friend requests retrieved successfully",
    data: result,
  });
});

const getSentFriendRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await FriendService.getSentFriendRequests(req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sent friend requests retrieved successfully",
    data: result,
  });
});

const getFriendsEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await FriendService.getFriendsEvents(req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Friends events retrieved successfully",
    data: result,
  });
});

const removeFriend = catchAsync(async (req: Request, res: Response) => {
  const { friendId } = req.params;
  const result = await FriendService.removeFriend(req.user.id, friendId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data:result
  });
});

const getFriendParticipatedEvents = catchAsync(async (req: Request, res: Response) => {
  const { friendId } = req.params;
  const result = await FriendService.getFriendParticipatedEvents(req.user.id, friendId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Friend participateddd events retrieved successfully",
    data: result,
  });
});

export const FriendController = {
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  getFriendRequests,
  getSentFriendRequests,
  getFriendsEvents,
  removeFriend,
  getFriendParticipatedEvents,
};