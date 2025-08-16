import { NextFunction, Request, RequestHandler, Response } from "express";
import ErrorResponse from "../utils/ErrorResponse";
import { prisma } from "../server";

const getAllCategories: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await prisma.category.findMany({});

    res.status(200).json({
      success: true,
      message: "Categories Fetched",
      categories: categories,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
};

const getAllProductsOfCategories: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categoryId = req.query.categoryId as string;

    const categoryExist = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!categoryExist) {
      return next(new ErrorResponse("Category not exist", 404));
    }

    try {
      const getAllProducts = await prisma.product.findMany({
        where: {
          categoryId: categoryId,
        },
      });

      res.status(200).json({
        success: true,
        messsage: "Products Retrived",
        products: getAllProducts,
      });
    } catch (error) {
      return next(
        new ErrorResponse(
          `Something Went Wrong while getting category data: ${error.message}`,
          500
        )
      );
    }
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
};

const getProduct: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = req.query.productId as string;

    if (!productId) {
      return next(new ErrorResponse("Product Id required", 404));
    }

    const productExist = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!productExist) {
      return next(new ErrorResponse("Product Not Exist", 404));
    }

    res.status(200).json({
      success: true,
      message: "Product Retrived",
      product: productExist,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
};

export { getAllCategories, getAllProductsOfCategories, getProduct };
