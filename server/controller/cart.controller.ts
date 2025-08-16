import { NextFunction, Request, RequestHandler, Response } from "express";
import ErrorResponse from "../utils/ErrorResponse";
import { prisma } from "../server";



// Add item to cart
export const addToCart: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.id;
    if (!userId) {
        return next(new ErrorResponse("User not authenticated", 401));
    }
    const { productId, variantId, quantity, price } = req.body;
    try {
        let cart = await prisma.cart.findFirst({ where: { userId, active: true } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId } });
        }
        const item = await prisma.cartItem.create({
            data: { cartId: cart.id, productId, variantId, quantity, price },
        });
        res.status(201).json({
            success: true,
            message: "Item added to cart successfully",
            item,
        });
    } catch (err) {
        return next(new ErrorResponse(err.message + "Add to cart failed", 400));
    }
};

// View cart
export const getCart: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.id;
    if (!userId) {
        return next(new ErrorResponse("User not authenticated", 401));
    }
    try {
        const cart = await prisma.cart.findFirst({
            where: { userId, active: true },
            include: { items: { include: { product: true, variant: true } } },
        });
        res.status(201).json({
            success: true,
            message: "Cart retrieved successfully",
            cart
        });
    } catch (err) {
        return next(new ErrorResponse(err.message + "Cart retrieved failed", 401));
    }
};
