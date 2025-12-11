import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReviewService } from "./review.service";
import httpStatus from "http-status-codes";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const { rating, comment, eventId } = req.body;
  const result = await ReviewService.createReview({
    rating,
    comment,
    eventId,
    reviewerId: req.user.id,
  });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getAllReviews();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All reviews retrieved successfully",
    data: result,
  });
});

const getHostReviews = catchAsync(async (req: Request, res: Response) => {
  const { hostId } = req.params;
  const result = await ReviewService.getHostReviews(hostId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Host reviews retrieved successfully",
    data: result,
  });
});

const getEventReviews = catchAsync(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const result = await ReviewService.getEventReviews(eventId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event reviews retrieved successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewService.updateReview(id, req.body, req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewService.deleteReview(id, req.user.id, req.user.role!);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const ReviewController = {
  createReview,
  getAllReviews,
  getHostReviews,
  getEventReviews,
  updateReview,
  deleteReview,
};