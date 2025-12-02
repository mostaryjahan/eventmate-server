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

export const UserController = {
    createUser
}