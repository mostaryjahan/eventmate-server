import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { EventService } from "./event.service";
import httpStatus from "http-status-codes";
import pick from "../../helpers/pick";

const createEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.createEvent(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Event created successfully",
    data: result,
  });
});

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["search", "type", "location", "status"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await EventService.getAllEvents(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Events retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getMyHostedEvents = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["search", "type", "location", "status"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await EventService.getMyHostedEvents(req.user!.id, filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My hosted events retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getMyJoinedEvents = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["search", "type", "location", "status"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await EventService.getMyJoinedEvents(req.user!.id, filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My joined events retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getEventById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EventService.getEventById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event retrieved successfully",
    data: result,
  });
});

const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EventService.updateEvent(id, req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event updated successfully",
    data: result,
  });
});

const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EventService.deleteEvent(id, req.user!.id, req.user!.role!);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const joinEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EventService.joinEvent(id, req.user!.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Joined event successfully",
    data: result,
  });
});

const leaveEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EventService.leaveEvent(id, req.user!.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});



// get participants of an event
const getParticipants = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EventService.getParticipants(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Participants retrieved successfully",
    data: result,
  });
});

export const EventController = {
  createEvent,
  getAllEvents,
  getMyHostedEvents,
  getMyJoinedEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getParticipants,
};