import Stripe from "stripe";
import { prisma } from "../../shared/prisma";
import { PaymentStatus } from "@prisma/client";
import { stripe } from "../../../config/stripe";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

const createPaymentSession = async (eventId: string, userId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  if (event.joiningFee === 0) throw new AppError(httpStatus.BAD_REQUEST, "This is a free event");

  const existingPayment = await prisma.payment.findFirst({
    where: { eventId, userId, status: PaymentStatus.PAID },
  });
  if (existingPayment) throw new AppError(httpStatus.BAD_REQUEST, "Already paid for this event");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: event.name },
        unit_amount: Math.round(event.joiningFee * 100),
      },
      quantity: 1,
    }],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/events/${eventId}?payment=success`,
    cancel_url: `${process.env.CLIENT_URL}/events/${eventId}?payment=cancelled`,
    metadata: { eventId, userId },
  });

  await prisma.payment.create({
    data: {
      amount: event.joiningFee,
      eventId,
      userId,
      stripeSessionId: session.id,
    },
  });

  return { sessionUrl: session.url };
};

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { eventId, userId } = session.metadata!;

      await prisma.payment.update({
        where: { stripeSessionId: session.id },
        data: {
          status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.FAILED,
          paymentGatewayData: session,
        },
      });

      if (session.payment_status === "paid") {
        await prisma.eventParticipant.create({
          data: { eventId, userId },
        }).catch(() => {});
      }
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

const getUserPayments = async (userId: string) => {
  return await prisma.payment.findMany({
    where: { userId },
    include: { event: { select: { id: true, name: true, dateTime: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const PaymentService = {
  createPaymentSession,
  handleStripeWebhookEvent,
  getUserPayments,
};