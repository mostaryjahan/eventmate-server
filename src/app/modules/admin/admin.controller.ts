import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AdminService } from "./admin.service";
import httpStatus from "http-status-codes";

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getDashboardStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard stats retrieved successfully",
    data: result,
  });
});

const manageUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { action } = req.body;
  const result = await AdminService.manageUser(userId, action);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User ${action}d successfully`,
    data: result,
  });
});

const moderateEvent = catchAsync(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { action } = req.body;
  const result = await AdminService.moderateEvent(eventId, action);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Event ${action}d successfully`,
    data: result,
  });
});

export const AdminController = {
  getDashboardStats,
  manageUser,
  moderateEvent,
};