import { prisma } from "../../shared/prisma";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { EventStatus } from "@prisma/client";

const getAllReviews = async () => {
  const reviews = await prisma.review.findMany({
    include: {
      reviewer: { select: { id: true, name: true, image: true } },
      event: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

const createReview = async (payload: {
  rating: number;
  comment?: string;
  eventId: string;
  reviewerId: string;
}) => {
  const { rating, comment, eventId, reviewerId } = payload;

  // Check if event exists and is completed
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { participants: true },
  });

  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  if (event.status !== EventStatus.COMPLETED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Reviews are allowed only for completed events.");
  }

  // Check if user participated in the event
  const participated = event.participants.some(p => p.userId === reviewerId);
  if (!participated) {
    throw new AppError(httpStatus.FORBIDDEN, "Can only review events you participated in");
  }

  // Check if already reviewed
  const existingReview = await prisma.review.findUnique({
    where: { eventId_reviewerId: { eventId, reviewerId } },
  });

  if (existingReview) {
    throw new AppError(httpStatus.BAD_REQUEST, "Already reviewed this event");
  }

  const result = await prisma.review.create({
    data: {
      rating,
      comment,
      eventId,
      reviewerId,
      hostId: event.createdBy,
    },
    include: {
      reviewer: { select: { id: true, name: true, image: true } },
      event: { select: { id: true, name: true } },
    },
  });

  return result;
};

const getHostReviews = async (hostId: string) => {
  const reviews = await prisma.review.findMany({
    where: { hostId },
    include: {
      reviewer: { select: { id: true, name: true, image: true } },
      event: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const avgRating = await prisma.review.aggregate({
    where: { hostId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    reviews,
    averageRating: avgRating._avg.rating || 0,
    totalReviews: avgRating._count.rating,
  };
};

const getEventReviews = async (eventId: string) => {
  const reviews = await prisma.review.findMany({
    where: { eventId },
    include: {
      reviewer: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

const updateReview = async (reviewId: string, payload: { rating?: number; comment?: string }, userId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  
  if (!review) throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  if (review.reviewerId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Can only update your own reviews");
  }

  const result = await prisma.review.update({
    where: { id: reviewId },
    data: payload,
    include: {
      reviewer: { select: { id: true, name: true, image: true } },
      event: { select: { id: true, name: true } },
    },
  });

  return result;
};

const deleteReview = async (reviewId: string, userId: string, userRole: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  
  if (!review) throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  if (review.reviewerId !== userId && userRole !== "ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "Not authorized to delete this review");
  }

  await prisma.review.delete({ where: { id: reviewId } });
  return { message: "Review deleted successfully" };
};

export const ReviewService = {
  getAllReviews,
  createReview,
  getHostReviews,
  getEventReviews,
  updateReview,
  deleteReview,
};