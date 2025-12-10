import { prisma } from "../../shared/prisma";
import { Prisma, EventStatus } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helpers/paginationHelpers";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

const createEvent = async (req: any) => {
  const bodyData = req.body.data ? JSON.parse(req.body.data) : req.body;

 
  const { name, typeId, description, dateTime, location, minParticipants, maxParticipants, joiningFee } = bodyData;
 
  
  const eventType = await prisma.eventType.findUnique({ where: { id: typeId } });
  if (!eventType) throw new AppError(httpStatus.NOT_FOUND, "Event type not found");

  const minPart = Number(minParticipants) || 1;
  const maxPart = Number(maxParticipants);
  
  if (minPart > maxPart) {
    throw new AppError(httpStatus.BAD_REQUEST, "Minimum participants cannot exceed maximum participants");
  }
  
  const eventImage = req.file?.path;
 
  const result = await prisma.event.create({
    data: {
      name,
      description,
      dateTime: new Date(dateTime),
      location,
      image: eventImage,
      minParticipants: minPart,
      maxParticipants: maxPart,
      joiningFee: Number(joiningFee) || 0.0,
      status: EventStatus.OPEN,
      typeId,
      createdBy: req.user.id,
    },
    include: {
      type: true,
      creator: { select: { id: true, name: true, email: true } },
      participants: true,
    },
  });

  return result;
};

const getAllEvents = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { search, type, location, status, ...filterData } = params;

  const andConditions: Prisma.EventWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (type) andConditions.push({ typeId: type });
  if (location) andConditions.push({ location: { contains: location, mode: "insensitive" } });
  if (status) andConditions.push({ status });

  const whereConditions: Prisma.EventWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.event.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: { [sortBy]: sortOrder },
    include: {
      type: true,
      creator: { select: { id: true, name: true, email: true } },
      _count: { select: { participants: true } },
    },
  });

  const total = await prisma.event.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getMyHostedEvents = async (userId: string, params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { search, type, location, status } = params;

  const andConditions: Prisma.EventWhereInput[] = [{ createdBy: userId }];

  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (type) andConditions.push({ typeId: type });
  if (location) andConditions.push({ location: { contains: location, mode: "insensitive" } });
  if (status) andConditions.push({ status });

  const whereConditions: Prisma.EventWhereInput = { AND: andConditions };

  const result = await prisma.event.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: { [sortBy]: sortOrder },
    include: {
      type: true,
      creator: { select: { id: true, name: true, email: true } },
      _count: { select: { participants: true } },
    },
  });

  const total = await prisma.event.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getMyJoinedEvents = async (userId: string, params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { search, type, location, status } = params;

  const andConditions: Prisma.EventWhereInput[] = [
    { participants: { some: { userId } } }
  ];

  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (type) andConditions.push({ typeId: type });
  if (location) andConditions.push({ location: { contains: location, mode: "insensitive" } });
  if (status) andConditions.push({ status });

  const whereConditions: Prisma.EventWhereInput = { AND: andConditions };

  const result = await prisma.event.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: { [sortBy]: sortOrder },
    include: {
      type: true,
      creator: { select: { id: true, name: true, email: true } },
      _count: { select: { participants: true } },
    },
  });

  const total = await prisma.event.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getEventById = async (id: string) => {
  const result = await prisma.event.findUnique({
    where: { id },
    include: {
      type: true,
      creator: { select: { id: true, name: true, email: true, image: true } },
      participants: { include: { user: { select: { id: true, name: true, email:true, image: true } } } },
      reviews: { include: { reviewer: { select: { id: true, name: true } } } },
      _count: { select: { participants: true } },
    },
  });

  if (!result) throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  return result;
};

const updateEvent = async (id: string, req: any) => {
  const bodyData = req.body.data ? JSON.parse(req.body.data) : req.body;
  
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  
  if (event.createdBy !== req.user.id && req.user.role !== "ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "Not authorized to update this event");
  }

  if (bodyData.typeId) {
    const eventType = await prisma.eventType.findUnique({ where: { id: bodyData.typeId } });
    if (!eventType) throw new AppError(httpStatus.NOT_FOUND, "Event type not found");
  }

  const eventImage = req.file?.path || event.image;

  const result = await prisma.event.update({
    where: { id },
    data: {
      ...bodyData,
      image: eventImage,
      dateTime: bodyData.dateTime ? new Date(bodyData.dateTime) : event.dateTime,
    },
    include: {
      type: true,
      creator: { select: { id: true, name: true, email: true } },
      participants: true,
    },
  });

  return result;
};

const deleteEvent = async (id: string, userId: string, userRole: string) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  
  if (event.createdBy !== userId && userRole !== "ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "Not authorized to delete this event");
  }

  await prisma.event.delete({ where: { id } });
  return { message: "Event deleted successfully" };
};

const joinEvent = async (eventId: string, userId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { participants: true } } },
  });

  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  if (event.status !== EventStatus.OPEN) throw new AppError(httpStatus.BAD_REQUEST, "Event is not open for joining");
  if (event.maxParticipants && event._count.participants >= event.maxParticipants) {
    throw new AppError(httpStatus.BAD_REQUEST, "Event is full");
  }

  const existingParticipant = await prisma.eventParticipant.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });

  if (existingParticipant) throw new AppError(httpStatus.BAD_REQUEST, "Already joined this event");

  const result = await prisma.eventParticipant.create({
    data: { eventId, userId },
    include: { event: true, user: { select: { id: true, name: true } } },
  });

  // Update event status if full
  const updatedCount = await prisma.eventParticipant.count({ where: { eventId } });
  if (event.maxParticipants && updatedCount >= event.maxParticipants) {
    await prisma.event.update({
      where: { id: eventId },
      data: { status: EventStatus.FULL },
    });
  }

  return result;
};

const leaveEvent = async (eventId: string, userId: string) => {
  const participant = await prisma.eventParticipant.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });

  if (!participant) throw new AppError(httpStatus.NOT_FOUND, "Not a participant of this event");

  await prisma.eventParticipant.delete({
    where: { eventId_userId: { eventId, userId } },
  });

  // Update event status if no longer full
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (event?.status === EventStatus.FULL) {
    await prisma.event.update({
      where: { id: eventId },
      data: { status: EventStatus.OPEN },
    });
  }

  return { message: "Left event successfully" };
};



// get participants of an event
const getParticipants = async (eventId: string) => {
  const participants = await prisma.eventParticipant.findMany({
    where: { eventId },
    include: { user: { select: { id: true, name: true, email: true, bio:true, location: true, image: true,interests:true } } },
  });

  return participants;
};

export const EventService = {
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