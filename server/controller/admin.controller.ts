import { NextFunction, Request, RequestHandler, Response } from "express";
import ErrorResponse from "../utils/ErrorResponse";
import { prisma } from "../server";

const getUnverifiedUsers: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        kycVerified: false,
      },
    });

    res.status(200).json({
      success: true,
      users: users,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
};

const verifyUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.query.userId as string;
    console.log("Verifying user with ID:", userId);

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const verifiedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        kycVerified: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "User verified successfully",
      user: verifiedUser,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
};

const creatCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryName, imageUrl } = req.body;
    console.log(categoryName,imageUrl)

    if (!categoryName || !imageUrl) {
      return next(new ErrorResponse("Category Name and image is required", 404));
    }

    const categoryExist = await prisma.category.findUnique({
      where: {
        name: categoryName,
      },
    });

    if (categoryExist) {
      return next(new ErrorResponse("Category Already Exist", 409));
    }

    try {
      const newCategory = await prisma.category.create({
        data: {
          name: categoryName,
          image: imageUrl
        },
      });

      res.status(201).json({
        success: true,
        message: "Catergory Created",
        category: newCategory,
      });
    } catch (error) {
      return next(
        new ErrorResponse(
          `Something Went Wrong while creating category: ${error.message}`,
          500
        )
      );
    }
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
};

const creatProducts: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productName, description, price, images, color, sizes, isActive } = req.body;

    const categoryId = req.query.categoryId as string;

    if (!productName || !price || !categoryId || !color || !sizes) {
      return next(
        new ErrorResponse(
          "Product name, price, color,sizes and categoryId are required",
          400
        )
      );
    }

    // Validate sizes is an array
    if (!Array.isArray(sizes) || sizes.length === 0) {
      return next(
        new ErrorResponse(
          "Sizes must be a non-empty array of strings",
          400
        )
      );
    }

    const categoryExists = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!categoryExists) {
      return next(new ErrorResponse("Category not found", 404));
    }

    try {
      const product = await prisma.product.create({
        data: {
          name: productName,
          description,
          price: parseFloat(price),
          images: images || [],
          isActive: isActive !== undefined ? isActive : true,
          categoryId: categoryId,
          color: color,
          sizes: sizes,
        },
        include: {
          category: true,
        },
      });

      return res.status(200).json({
        succes: true,
        message: "Product Created",
        product: product,
      });
    } catch (error) {
      return next(new ErrorResponse(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
};

// Get all orders with status 'pending'
const getPendingOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pendingOrders = await prisma.order.findMany({
      where: { status: "pending" },
      include: { user: true, items: true },
      orderBy: { createdAt: "desc" }
    });
    res.status(201).json({
      success: true,
      message: "Pending orders retrieved successfully",
      pendingOrders,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
};

// Approve one or more orders by ID (change status)
const approveOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Accept single ID or array of IDs in body
    const { orderId, newStatus = "paid" } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "No order IDs provided" });
    }

    const updated = await prisma.order.updateMany({
      where: { id: orderId },
      data: { status: newStatus }
    });

    res.status(201).json({
      success: true,
      message: "Orders approved successfully",
      updatedCount: updated.count,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
};


const markOrderShipped = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    // Only mark as shipped if currently "paid"
    const order = await prisma.order.updateMany({
      where: { id: orderId, status: "paid" },
      data: { status: "shipped" }
    });

    if (order.count === 0) {
      return res.status(404).json({ error: "No matching 'paid' order found with this ID" });
    }

    res.status(201).json({
      success: true,
      message: "Order marked as shipped successfully",
      updatedCount: order.count,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
};


// Set credit limit for a user
const setCreditLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, creditBal } = req.body;

    // Simple validation
    if (!userId || typeof creditBal !== "number") {
      return res.status(400).json({ error: "userId and creditBal (number) are required." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { creditBal }
    });

    res.status(201).json({
      success: true,
      message: "Credit limit updated successfully.",
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        creditBal: updatedUser.creditBal
      }
    });
  } catch (error) {
    // Handle not found, etc.
    return next(new ErrorResponse(error.message, 500));
  }
};


// Update user's credit
const updateCreditLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, newCredit } = req.body;
    if (!userId || typeof newCredit !== "number") {
      return res.status(400).json({ error: "userId and newCredit required" });
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { creditBal: newCredit }
    });

    res.status(201).json({
      success: true,
      message: "Credit limit updated successfully",
      user,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
};

export { getUnverifiedUsers, verifyUser, creatCategory, creatProducts, getPendingOrders, approveOrder, setCreditLimit, updateCreditLimit, markOrderShipped };
