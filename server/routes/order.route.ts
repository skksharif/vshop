import { Router } from "express";   
import { placeOrder, getOrders } from "../controller/order.controller";

const router = Router();

// Place an order (POST /api/orders)
router.post("/orders", placeOrder);

// Get all orders for the authenticated user (GET /api/orders)
router.get("/orders", getOrders);

export default router;