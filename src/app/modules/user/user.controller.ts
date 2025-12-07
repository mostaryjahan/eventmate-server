import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";

const createUser =catchAsync(async(req: Request,res: Response)=>{
 const result = await UserService.createUser(req);

sendResponse (res, {
    statusCode: 201,
    success: true,
    message: "Signup successfully",
    data: result
})
})



// update user
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateUser(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});


// get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query, req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});


// get user by id
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
    const result = await UserService.getUserById(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User retrieved successfully",
      data: result,
    });
});

// update my profile
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateMyProfile(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const UserController = {
    createUser,
    updateUser,
    getAllUsers,
    getUserById,
    updateMyProfile
}