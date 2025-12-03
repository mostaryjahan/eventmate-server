import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";
import httpStatus from "http-status-codes";
import { stripe } from "../../../config/stripe";

const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const { eventId } = req.body;
  const result = await PaymentService.createPaymentSession(eventId, req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment session created successfully",
    data: result,
  });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  
  await PaymentService.handleStripeWebhookEvent(event);
  res.status(200).send("OK");
});

const getUserPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getUserPayments(req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments retrieved successfully",
    data: result,
  });
});

export const PaymentController = {
  createPaymentSession,
  handleWebhook,
  getUserPayments,
};