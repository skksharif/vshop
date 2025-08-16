import { Router } from "express";
import { addToCart, getCart } from "../controller/cart.controller";

const router = Router();

// Add item to cart
router.post("/cart", addToCart);

// View current active cart for logged-in user
router.get("/cart", getCart);