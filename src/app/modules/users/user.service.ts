import { envVars } from "../../../config/env";
import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import { prisma } from "../../shared/prisma";
import AppError from "../../errorHelpers/AppError";
import { UserRole } from "@prisma/client";


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


export const UserService = {
  createUser,
};