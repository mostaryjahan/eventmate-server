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
    success_url: `${process.env.FRONTEND_URL}/events/${eventId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/events/${eventId}?payment=cancelled`,
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

  return { url: session.url };
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
          paymentGatewayData: JSON.parse(JSON.stringify(session)),
        },
      });

      if (session.payment_status === "paid") {
        const existingParticipant = await prisma.eventParticipant.findUnique({
          where: { eventId_userId: { eventId, userId } },
        });

        if (!existingParticipant) {
          await prisma.eventParticipant.create({
            data: { eventId, userId },
          });
        }
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

const verifyPayment = async (sessionId: string, userId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: sessionId },
  });

  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  if (payment.userId !== userId) throw new AppError(httpStatus.FORBIDDEN, "Unauthorized");

  if (session.payment_status === "paid") {
    if (payment.status !== PaymentStatus.PAID) {
      await prisma.payment.update({
        where: { stripeSessionId: sessionId },
        data: { status: PaymentStatus.PAID, paymentGatewayData: JSON.parse(JSON.stringify(session)) },
      });

      const existingParticipant = await prisma.eventParticipant.findUnique({
        where: { eventId_userId: { eventId: payment.eventId, userId } },
      });

      if (!existingParticipant) {
        await prisma.eventParticipant.create({
          data: { eventId: payment.eventId, userId },
        });
      }
    }
    return { status: PaymentStatus.PAID, eventId: payment.eventId };
  }

  return { status: payment.status, eventId: payment.eventId };
};

export const PaymentService = {
  createPaymentSession,
  handleStripeWebhookEvent,
  getUserPayments,
  verifyPayment,
};