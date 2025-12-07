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

  const { email, password, name, role = UserRole.USER, bio, interests, location } = bodyData;

  // check existing user
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) throw new AppError(httpStatus.BAD_REQUEST, "Email already exists");

  const hashedPassword = await bcrypt.hash(password, Number(envVars.BCRYPT_SALT_ROUND));

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
  const bodyData ={ ...req.body };

  const existingUser = await prisma.user.findUnique({ where: { id }});

  if (!existingUser) throw new AppError(httpStatus.BAD_REQUEST, "User not found");

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


// get all users
const getAllUsers = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { search, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: search,
          mode: "insensitive",
        },
      })),
    });
  }

    if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

      const result = await prisma.user.findMany({
    skip,
    take: limit,

    where: whereConditions,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
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
  if (!existingUser) throw new AppError(httpStatus.BAD_REQUEST, "User not found");

  const profileImage = req.file?.path;
  if (profileImage) {
    bodyData.image = profileImage;
  }

  if (bodyData.interests && typeof bodyData.interests === 'string') {
    bodyData.interests = bodyData.interests.split(',').map((item: string) => item.trim()).filter(Boolean);
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: bodyData,
  });

  const { password: _, ...updatedUser } = result;
  return updatedUser;
};

export const UserService = {
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  updateMyProfile
};