import { Router } from "express";
import { placeOrder, getOrders } from "../controller/order.controller";
import { optionalAuth } from "../middleware/auth.middleware";

const router = Router();

// Place an order (POST /api/orders)
router.post("/orders", optionalAuth, placeOrder);

// Get all orders for the authenticated user (GET /api/orders)
router.get("/orders", optionalAuth, getOrders);

export default router;
