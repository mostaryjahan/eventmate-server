import { envVars } from "../../../config/env";
import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import { prisma } from "../../shared/prisma";
import AppError from "../../errorHelpers/AppError";
import { Prisma, UserRole } from "@prisma/client";
import { userSearchableFields } from "./user.constant";
import { IOptions, paginationHelper } from "../../helpers/paginationHelpers";

// register new user
const createUser = async (req: any) => {
  let bodyData = req.body.data ? JSON.parse(req.body.data) : req.body;

  const {
    email,
    password,
    name,
    role = UserRole.USER,
    bio,
    interests,
    location,
  } = bodyData;

  // check existing user
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser)
    throw new AppError(httpStatus.BAD_REQUEST, "Email already exists");

  const hashedPassword = await bcrypt.hash(
    password,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  // handle file if uploaded
  const profileImage = req.file?.path;

  const result = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      bio,
      interests: interests || [],
      location,
      image: profileImage,
    },
  });

  const { password: _, ...newUser } = result;
  return newUser;
};

// update user
const updateUser = async (req: any) => {
  const { id } = req.params;
  const bodyData = { ...req.body };

  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser)
    throw new AppError(httpStatus.BAD_REQUEST, "User not found");

  if (req.user.role !== "admin") {
    delete bodyData.role;
  }

  const result = await prisma.user.update({
    where: { id },
    data: bodyData,
  });

  const { password: _, ...newUser } = result;
  return newUser;
};


const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return users;
};

// get user by id
const getUserById = async (id: string) => {
  const result = await prisma.user.findUnique({ where: { id } });
  if (!result) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  const { password, ...user } = result;
  return user;
};

// update my profile
const updateMyProfile = async (req: any) => {
  const userId = req.user.id;

  let bodyData = { ...req.body };

  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser)
    throw new AppError(httpStatus.BAD_REQUEST, "User not found");

  const profileImage = req.file?.path;
  if (profileImage) {
    bodyData.image = profileImage;
  }

  if (bodyData.interests && typeof bodyData.interests === "string") {
    bodyData.interests = bodyData.interests
      .split(",")
      .map((item: string) => item.trim())
      .filter(Boolean);
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: bodyData,
  });

  const { password: _, ...updatedUser } = result;
  return updatedUser;
};

// update role user to host
const updateRole = async (req: any) => {
  const { id } = req.params;
  const bodyData = { ...req.body };

  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser)
    throw new AppError(httpStatus.BAD_REQUEST, "User not found");
  const result = await prisma.user.update({
    where: { id },
    data: bodyData,
  });
  const { password: _, ...updatedUser } = result;
  return updatedUser;
};


// delete user
const deleteUser = async (id: string) => {
  const result = await prisma.user.delete({ where: { id } });
  if (!result) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  return result;
};


// apply for host
const applyForHost = async (req: any) => {
  const userId = req.user.id;
  
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  
  if (existingUser.role === UserRole.HOST) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is already a host");
  }
  
  const existingApplication = await prisma.hostApplication.findUnique({ where: { userId } });
  if (existingApplication) {
    throw new AppError(httpStatus.BAD_REQUEST, "Host application already exists");
  }
  
  const result = await prisma.hostApplication.create({
    data: { userId }
  });
  
  return result;
};

// get all host applications
const getAllHostApplications = async () => {
  const applications = await prisma.hostApplication.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    },
    orderBy: { appliedAt: "desc" }
  });

  return applications;
};

// approve host application
const approveHostApplication = async (userId: string) => {
  const application = await prisma.hostApplication.findUnique({ where: { userId } });
  if (!application) {
    throw new AppError(httpStatus.NOT_FOUND, "Host application not found");
  }

  await prisma.$transaction([
    prisma.hostApplication.update({
      where: { userId },
      data: { status: "APPROVED" }
    }),
    prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.HOST }
    })
  ]);
  
  return { message: "Host application approved successfully" };
};

// reject host application
const rejectHostApplication = async (userId: string) => {
  const application = await prisma.hostApplication.findUnique({ where: { userId } });
  if (!application) {
    throw new AppError(httpStatus.NOT_FOUND, "Host application not found");
  }

  await prisma.hostApplication.delete({ where: { userId } });
  
  return { message: "Host application rejected" };
};

// save event
const saveEvent = async (req: any) => {
  const userId = req.user?.id;
  const { eventId } = req.body;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existingEvent) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  const existingSave = await prisma.savedEvent.findUnique({
    where: { userId_eventId: { userId, eventId } }
  });
  
  if (existingSave) {
    throw new AppError(httpStatus.BAD_REQUEST, "Event already saved");
  }

  const result = await prisma.savedEvent.create({
    data: { userId, eventId }
  });

  return result;
};

// unsave event
const unsaveEvent = async (req: any) => {

  const userId = req.user?.id;
  const { eventId } = req.params;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const existingSave = await prisma.savedEvent.findUnique({
    where: { userId_eventId: { userId, eventId } }
  });
  
  if (!existingSave) {
    throw new AppError(httpStatus.NOT_FOUND, "Saved event not found");
  }

  await prisma.savedEvent.delete({
    where: { userId_eventId: { userId, eventId } }
  });

  return { message: "Event unsaved successfully" };
};

// get saved events
const getSavedEvents = async (req: any) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const savedEvents = await prisma.savedEvent.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          type: true,
          _count: {
            select: { participants: true }
          }
        }
      }
    },
    orderBy: { savedAt: "desc" }
  });

  return savedEvents.map(saved => saved.event);
};

// check if event is saved
const checkEventSaved = async (req: any) => {
  const userId = req.user.id;
  const { eventId } = req.params;

  const savedEvent = await prisma.savedEvent.findUnique({
    where: { userId_eventId: { userId, eventId } }
  });

  return { isSaved: !!savedEvent };
};

// check host application status
const checkHostApplicationStatus = async (req: any) => {
  const userId = req.user.id;
  
  const application = await prisma.hostApplication.findUnique({ where: { userId } });
  
  return { hasApplied: !!application };
};

// cancel host application
const cancelHostApplication = async (req: any) => {
  const userId = req.user.id;
  
  const application = await prisma.hostApplication.findUnique({ where: { userId } });
  if (!application) {
    throw new AppError(httpStatus.NOT_FOUND, "Host application not found");
  }
  
  await prisma.hostApplication.delete({ where: { userId } });
  
  return { message: "Host application cancelled successfully" };
};

export const UserService = {
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  updateMyProfile,
  updateRole,
  deleteUser,
  applyForHost,
  getAllHostApplications,
  approveHostApplication,
  rejectHostApplication,
  saveEvent,
  unsaveEvent,
  getSavedEvents,
  checkEventSaved,
  checkHostApplicationStatus,
  cancelHostApplication,
};
