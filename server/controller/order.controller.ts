import { NextFunction, Request, RequestHandler, Response } from "express";
import ErrorResponse from "../utils/ErrorResponse";
import { prisma } from "../server";

// Place order
export const placeOrder: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  if (!userId) {
    return next(new ErrorResponse("User not authenticated", 401));
  }

  const { items, total, paymentOption } = req.body;
  try {
    // Validate paymentOption (optional, but a good idea)
    if (
      paymentOption &&
      !["FULL_PAYMENT", "EMI_3_MONTH", "EMI_6_MONTH"].includes(paymentOption)
    ) {
      return next(new ErrorResponse("Invalid payment option", 400));
    }

    const order = await prisma.order.create({
      data: {
        userId,
        items: { create: items }, // items: [{ productId, variantId, quantity, price }]
        total,
        status: "pending", // Default to 'pending' for new orders (or from req.body/status for flexibility)
        paymentOption: paymentOption || "FULL_PAYMENT"
      },
      include: { items: true } // include order items in response
    });

    // Optionally mark user's cart(s) as inactive after placing order
    await prisma.cart.updateMany({ where: { userId, active: true }, data: { active: false } });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });
  } catch (err: any) {
    return next(new ErrorResponse(err.message, 401));
  }
};


export const getOrders: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.id;
    if (!userId) {
        return next(new ErrorResponse("User not authenticated", 401));
    }
    try {
        const orders = await prisma.order.findMany({
            where: { userId },
            include: { items: { include: { product: true, variant: true } } },
        });
        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orders,
        });
    } catch (err) {
        return next(new ErrorResponse(err.message, 401));
    }
};
