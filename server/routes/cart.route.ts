import { Router } from "express";
import { addToCart, getCart } from "../controller/cart.controller";
import { optionalAuth } from "../middleware/auth.middleware";

const router = Router();

// Add item to cart
router.post("/cart", optionalAuth,addToCart);

// View current active cart for logged-in user
router.get("/cart", optionalAuth,getCart);

export default router;