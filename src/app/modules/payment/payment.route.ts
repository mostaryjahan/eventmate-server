import express from "express";
import { PaymentController } from "./payment.controller";
import  checkAuth  from "../../middlewares/checkAuth";

const router = express.Router();

router.post("/create-session", checkAuth(), PaymentController.createPaymentSession);
router.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleWebhook);
router.get("/my-payments", checkAuth(), PaymentController.getUserPayments);
router.get("/verify", checkAuth(), PaymentController.verifyPayment);

export const paymentRoutes = router;