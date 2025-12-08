import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status-codes";
import { EventTypeService } from "./eventType.service";
import sendResponse from "../../utils/sendResponse";

const createType =catchAsync(async (req: Request, res: Response)=>{
 const result = await EventTypeService.createType(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Event type created successfully",
    data: result,
  });
})


const getAllTypes =catchAsync(async (req: Request, res: Response)=>{
   const result = await EventTypeService.getAllTypes({});
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Event types retrieved successfully",
      data: result,
    });
})

const updateType =catchAsync(async (req: Request, res: Response)=>{
  const { id } = req.params;
  const result = await EventTypeService.updateType(id, req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event type updated successfully",
    data: result,
  });
})


const deleteType =catchAsync(async (req: Request, res: Response)=>{
  const { id } = req.params;
  const result = await EventTypeService.deleteType(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event type deleted successfully",
    data: result,
  });
})


export const EventTypeController = {
    createType,
    getAllTypes,
    updateType,
    deleteType,
};