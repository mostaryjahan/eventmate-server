import { prisma } from "../../shared/prisma";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

const createType = async (req: any) => {
  const { name } = req.body;

  const existing = await prisma.eventType.findUnique({ where: { name } });
  if (existing)
    throw new AppError(httpStatus.BAD_REQUEST, "Event type already exists");

  return await prisma.eventType.create({ data: { name } });
};



const getAllTypes = async (params: any) => {
  return await prisma.eventType.findMany({ 
    include: { events: true },
    orderBy: { name: "asc" } 
  });
};

const updateType = async (id: string, req: any) => {
  const { name } = req.body;

  const existing = await prisma.eventType.findUnique({ where: { id } });
  if (!existing)
    throw new AppError(httpStatus.NOT_FOUND, "Event type not found");

  return await prisma.eventType.update({ where: { id }, data: { name } });
};

const deleteType = async (id: string) => {
  const existing = await prisma.eventType.findUnique({ where: { id } });
  if (!existing)
    throw new AppError(httpStatus.NOT_FOUND, "Event type not found");

  const hasEvents = await prisma.event.count({ where: { typeId: id } });
  if (hasEvents > 0)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete event type with existing events"
    );

  return await prisma.eventType.delete({ where: { id } });
};

export const EventTypeService = {
  createType,
  getAllTypes,
  updateType,
  deleteType,
};
