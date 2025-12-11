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
  const result = await UserService.getAllUsers();
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


// update role user to host
const updateRole = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateRole(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Role updated successfully",
    data: result,
  });
});


// delete user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.deleteUser(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

// apply for host
const applyForHost = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.applyForHost(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Host application submitted successfully. Please wait for admin approval.",
    data: result,
  });
});

// get all host applications
const getAllHostApplications = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllHostApplications();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Host applications retrieved successfully",
    data: result,
  });
});

// approve host application
const approveHostApplication = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await UserService.approveHostApplication(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Host application approved successfully",
    data: result,
  });
});

// reject host application
const rejectHostApplication = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await UserService.rejectHostApplication(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Host application rejected",
    data: result,
  });
});

// save event
const saveEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.saveEvent(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Event saved successfully",
    data: result,
  });
});

// unsave event
const unsaveEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.unsaveEvent(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event unsaved successfully",
    data: result,
  });
});

// get saved events
const getSavedEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getSavedEvents(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Saved events retrieved successfully",
    data: result,
  });
});

// check if event is saved
const checkEventSaved = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.checkEventSaved(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event saved status retrieved successfully",
    data: result,
  });
});

// check host application status
const checkHostApplicationStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.checkHostApplicationStatus(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Host application status retrieved successfully",
    data: result,
  });
});

// cancel host application
const cancelHostApplication = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.cancelHostApplication(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Host application cancelled successfully",
    data: result,
  });
});

export const UserController = {
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
    cancelHostApplication
}