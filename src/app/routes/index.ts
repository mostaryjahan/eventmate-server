import express from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { eventRoutes } from "../modules/event/event.route";
import { reviewRoutes } from "../modules/review/review.route";
import { paymentRoutes } from "../modules/payment/payment.route";
import { adminRoutes } from "../modules/admin/admin.route";
import { friendRoutes } from "../modules/friend/friend.route";
import { eventTypeRoutes } from "../modules/eventType/eventType.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
    {
    path: "/event-types",
    route: eventTypeRoutes,
  },
  {
    path: "/events",
    route: eventRoutes,
  },
  {
    path: "/reviews",
    route: reviewRoutes,
  },
  {
    path: "/payments",
    route: paymentRoutes,
  },
  {
    path: "/admin",
    route: adminRoutes,
  },
  {
    path: "/friends",
    route: friendRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
