import { prisma } from "../../shared/prisma";
import { UserRole, EventStatus } from "@prisma/client";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

const getDashboardStats = async () => {
  const [totalUsers, totalEvents, totalPayments, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
  ]);

  const eventsByStatus = await prisma.event.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return {
    totalUsers,
    totalEvents,
    totalRevenue: totalPayments._sum.amount || 0,
    recentUsers,
    eventsByStatus,
  };
};

const manageUser = async (userId: string, action: "promote" | "demote" | "ban") => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  let updateData: any = {};

  switch (action) {
    case "promote":
      if (user.role === UserRole.USER) updateData.role = UserRole.HOST;
      else if (user.role === UserRole.HOST) updateData.role = UserRole.ADMIN;
      break;
    case "demote":
      if (user.role === UserRole.ADMIN) updateData.role = UserRole.HOST;
      else if (user.role === UserRole.HOST) updateData.role = UserRole.USER;
      break;
    case "ban":
      // In a real app, you'd have a banned status
      throw new AppError(httpStatus.NOT_IMPLEMENTED, "Ban functionality not implemented");
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return result;
};

const moderateEvent = async (eventId: string, action: "approve" | "cancel") => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");

  const status = action === "approve" ? EventStatus.OPEN : EventStatus.CANCELLED;

  const result = await prisma.event.update({
    where: { id: eventId },
    data: { status },
  });

  return result;
};

export const AdminService = {
  getDashboardStats,
  manageUser,
  moderateEvent,
};