import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { generateToken, verifyToken } from "../../utils/jwt";
import { envVars } from "../../../config/env";
// import emailSender from "./emailSender";

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid password", "");
  }

  const accessToken = generateToken(
    { id: user.id, email: user.email, role: user.role },
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRY
  );

  const refreshToken = generateToken(
    { id: user.id, email: user.email, role: user.role },
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRY
  );

  const { password, ...userInfo } = user;

  return {
    accessToken,
    refreshToken,
    ...userInfo
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = verifyToken(token, envVars.JWT_REFRESH_SECRET) as JwtPayload;
  } catch (err) {
    throw new Error("You are not authorized!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email as string,
    },
  });

  const accessToken = generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRY
  );

  return {
    accessToken,
    // needPasswordChange: userData.needPasswordChange
  };
};

const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new Error("Password incorrect!");
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      // needPasswordChange: false
    },
  });

  return {
    message: "Password changed successfully!",
  };
};

// const forgotPassword = async (payload: { email: string }) => {
//   const userData = await prisma.user.findUniqueOrThrow({
//     where: {
//       email: payload.email,
//     },
//   });

//   const resetPassToken = generateToken(
//     { email: userData.email, role: userData.role },
//     envVars.JWT_ACCESS_SECRET as Secret,
//     envVars.JWT_REFRESH_EXPIRY as string
//   );

//   const resetPassLink =
//     config.reset_pass_link + `?userId=${userData.id}&token=${resetPassToken}`;

//   await emailSender(
//     userData.email,
//     `
//         <div>
//             <p>Dear User,</p>
//             <p>Your password reset link 
//                 <a href=${resetPassLink}>
//                     <button>
//                         Reset Password
//                     </button>
//                 </a>
//             </p>

//         </div>
//         `
//   );
// };

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
     
    },
  });

  const isValidToken = verifyToken(
    token,
    envVars.JWT_REFRESH_SECRET
  );

  if (!isValidToken) {
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  // hash password
  const password = await bcrypt.hash(
    payload.password,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  // update into database
  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
    },
  });
};

const getMe = async (session: any) => {
  const accessToken = session.accessToken;
  const decodedData = verifyToken(
    accessToken,
    envVars.JWT_ACCESS_SECRET
  ) as JwtPayload;

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email as string,
    },
  });

  const { id, email, role } = userData;

  return {
    id,
    email,
    role,
  };
};





export const AuthService = {
  login,
  changePassword,
//   forgotPassword,
  refreshToken,
  resetPassword,
  getMe
};
