import { prisma } from "../../shared/prisma";
import { FriendStatus } from "@prisma/client";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

const sendFriendRequest = async (userId: string, friendId: string) => {
  if (userId === friendId) throw new AppError(httpStatus.BAD_REQUEST, "Cannot add yourself as friend");

  const existingRequest = await prisma.friend.findUnique({
    where: { userId_friendId: { userId, friendId } }
  });

  if (existingRequest) throw new AppError(httpStatus.BAD_REQUEST, "Friend request already exists");

  const result = await prisma.friend.create({
    data: { userId, friendId },
    include: { friend: { select: { id: true, name: true, image: true } } }
  });

  return result;
};

const acceptFriendRequest = async (userId: string, friendId: string) => {
  const request = await prisma.friend.findUnique({
    where: { userId_friendId: { userId: friendId, friendId: userId } }
  });

  if (!request) throw new AppError(httpStatus.NOT_FOUND, "Friend request not found");

  const result = await prisma.friend.update({
    where: { userId_friendId: { userId: friendId, friendId: userId } },
    data: { status: FriendStatus.ACCEPTED }
  });

  // Create reverse friendship
  await prisma.friend.create({
    data: { userId, friendId, status: FriendStatus.ACCEPTED }
  });

  return result;
};

const getFriends = async (userId: string) => {
  const friends = await prisma.friend.findMany({
    where: { userId, status: FriendStatus.ACCEPTED },
    include: { friend: { select: { id: true, name: true, image: true } } }
  });

  return friends;
};

const getFriendRequests = async (userId: string) => {
  const requests = await prisma.friend.findMany({
    where: { friendId: userId, status: FriendStatus.PENDING },
    include: { user: { select: { id: true, name: true, image: true } } }
  });

  return requests;
};

const getFriendsEvents = async (userId: string) => {
  const friends = await prisma.friend.findMany({
    where: { userId, status: FriendStatus.ACCEPTED },
    select: { friendId: true }
  });

  const friendIds = friends.map(f => f.friendId);

  const events = await prisma.event.findMany({
    where: { createdBy: { in: friendIds } },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      _count: { select: { participants: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return events;
};

const removeFriend = async (userId: string, friendId: string) => {
  await prisma.friend.deleteMany({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId }
      ]
    }
  });

  return { message: "Friend removed successfully" };
};

export const FriendService = {
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  getFriendRequests,
  getFriendsEvents,
  removeFriend,
};