import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";
import httpStatus from "http-status-codes";
import { stripe } from "../../../config/stripe";

declare global {
  namespace Express {
    interface Request {
      user: { id: string; role?: string };
    }
  }
}

const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PaymentService.createPaymentSession(id, req.user.id);
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

const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.query;
  const result = await PaymentService.verifyPayment(sessionId as string, req.user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment verified successfully",
    data: result,
  });
});

export const PaymentController = {
  createPaymentSession,
  handleWebhook,
  getUserPayments,
  verifyPayment,
};