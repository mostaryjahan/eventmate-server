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
  // Get accepted friends
  const friends = await prisma.friend.findMany({
    where: { userId, status: FriendStatus.ACCEPTED },
    include: { friend: { select: { id: true, name: true, email: true, image: true } } }
  });

  // Get incoming requests (where user is receiver)
  const requests = await prisma.friend.findMany({
    where: { friendId: userId, status: FriendStatus.PENDING },
    include: { user: { select: { id: true, name: true, email: true, image: true } } }
  });

  // Get sent requests (where user is sender)
  const sentRequests = await prisma.friend.findMany({
    where: { userId, status: FriendStatus.PENDING },
    include: { friend: { select: { id: true, name: true, email: true, image: true } } }
  });

  console.log("[getFriends] Friends:", friends.length, "Requests:", requests.length, "Sent:", sentRequests.length);
  
  return {
    friends: friends.map(f => f.friend),
    requests: requests.map(r => r.user),
    sentRequests: sentRequests.map(s => ({ ...s, friend: s.friend }))
  };
};

const getFriendRequests = async (userId: string) => {
  const requests = await prisma.friend.findMany({
    where: { friendId: userId, status: FriendStatus.PENDING },
    include: { user: { select: { id: true, name: true, email: true, image: true } } }
  });
  console.log("[getFriendRequests] Incoming requests:", requests);
  return requests;
};

const getSentFriendRequests = async (userId: string) => {
  const requests = await prisma.friend.findMany({
    where: { userId, status: FriendStatus.PENDING },
    include: { friend: { select: { id: true, name: true, email: true, image: true } } }
  });
  console.log("[getSentFriendRequests] Sent requests:", requests);
  return requests;
};

const getFriendsEvents = async (userId: string) => {
  const friends = await prisma.friend.findMany({
    where: { userId, status: FriendStatus.ACCEPTED },
    select: { friendId: true }
  });

  const friendIds = friends.map(f => f.friendId);

  // Get events created by friends OR events where friends are participants
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { createdBy: { in: friendIds } }, // Events created by friends
        { 
          participants: {
            some: { userId: { in: friendIds } } // Events where friends are participants
          }
        }
      ]
    },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      type: { select: { id: true, name: true } },
      participants: {
        where: { userId: { in: friendIds } },
        include: {
          user: { select: { id: true, name: true, image: true } }
        }
      },
      _count: { select: { participants: true } }
    },
    orderBy: { dateTime: "desc" }
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

const getFriendParticipatedEvents = async (userId: string, friendId: string) => {
  // Verify friendship
  const friendship = await prisma.friend.findFirst({
    where: {
      userId,
      friendId,
      status: FriendStatus.ACCEPTED
    }
  });

  if (!friendship) throw new AppError(httpStatus.FORBIDDEN, "Not friends with this user");

  const events = await prisma.event.findMany({
    where: {
      participants: {
        some: { userId: friendId }
      }
    },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      type: { select: { id: true, name: true } },
      _count: { select: { participants: true } }
    },
    orderBy: { dateTime: "desc" }
  });

  return events;
};

export const FriendService = {
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  getFriendRequests,
  getSentFriendRequests,
  getFriendsEvents,
  removeFriend,
  getFriendParticipatedEvents,
};