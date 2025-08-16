import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../server";
import ErrorResponse from "../utils/ErrorResponse";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Authentication middleware to verify access token
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    // Extract access token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      accessToken = req.headers.authorization.split(" ")[1];
    }

    // Extract refresh token from X-Refresh-Token header
    if (req.headers["x-refresh-token"]) {
      refreshToken = req.headers["x-refresh-token"] as string;
    }

    if (!accessToken && refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET!
        ) as JwtPayload;

        const newAccessToken = jwt.sign(
          {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
          },
          process.env.ACCESS_TOKEN_SECRET!,
          {
            expiresIn: "15m",
          }
        );

        // Set user in request with role from refresh token
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        };

        // Send new access token in response header
        res.setHeader("X-New-Access-Token", newAccessToken);

        return next();
      } catch (error) {
        return next(new ErrorResponse("Invalid refresh token", 401));
      }
    }

    if (!accessToken) {
      return next(new ErrorResponse("No access token provided", 401));
    }

    try {
      // Verify the token
      const decoded = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayload;

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          userName: true,
          role: true,
        },
      });

      if (!user) {
        return next(new ErrorResponse("User not found", 401));
      }

      // Attach user to request object
      req.user = user as any;
      next();
    } catch (jwtError) {
      return next(new ErrorResponse("Invalid or expired token", 401));
    }
  } catch (error) {
    return next(new ErrorResponse("Authentication failed", 500));
  }
};

// Middleware to check if user has specific role
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("Checking admin role...");
    if (!req.user) {
      return next(
        new ErrorResponse("Access denied. Authentication required", 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Access denied. Required role: ${roles.join(" or ")}`,
          403
        )
      );
    }

    next();
  };
};

// Middleware specifically for admin routes
export const requireAdminRole = authorizeRoles("ADMIN");

// Middleware for routes accessible by multiple roles
export const requireDoctorOrHospital = authorizeRoles("USER");

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET!
        ) as JwtPayload;
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            userName: true,
            role: true,
          },
        });

        if (user) {
          req.user = user as any;
        }
      } catch (jwtError) {
        // Ignore token errors in optional auth
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Middleware to refresh access token using refresh token
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.headers["x-refresh-token"] as string;

    if (!refreshToken) {
      return next(new ErrorResponse("Refresh token not provided", 401));
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      ) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          userName: true,
          role: true,
        },
      });

      if (!user) {
        return next(new ErrorResponse("User not found", 401));
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
      );

      // Generate new refresh token
      const newRefreshToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          name: user.userName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (jwtError) {
      return next(new ErrorResponse("Invalid or expired refresh token", 401));
    }
  } catch (error) {
    return next(new ErrorResponse("Token refresh failed", 500));
  }
};
