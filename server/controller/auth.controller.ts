import { prisma } from "../server";
import { NextFunction, Request, RequestHandler, Response } from "express";
import ErrorResponse from "../utils/ErrorResponse";
import bcrypt from "bcrypt";
import { randomInt } from "crypto";
import jwt from "jsonwebtoken";
// import { sendEmail } from "../services/sendMail";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface UserData {
  username: string;
  email: string;
  role: string;
}

interface TokenPayload {
  user: {
    username: string;
    email: string;
    role: string;
  };
  code: number;
  type: "activation" | "forgotPassword";
  exp?: number;
  iat?: number;
}

interface UsedToken {
  token: string;
  email: string;
  usedAt: Date;
}

const usedTokens = new Set<string>();

// Helper function to validate required fields
const validateRequiredFields = (
  fields: Record<string, any>,
  requiredFields: string[]
) => {
  const missing = requiredFields.filter((field) => !fields[field]);
  if (missing.length > 0) {
    throw new ErrorResponse(
      `Missing required fields: ${missing.join(", ")}`,
      400
    );
  }
};

// Helper function to find user by email
const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({ where: { email } });
};

// Helper function to generate JWT tokens
const generateTokens = (
  payload: string | object,
  secretType: "access" | "refresh"
): string => {
  const secrets = {
    access: process.env.ACCESS_TOKEN_SECRET!,
    refresh: process.env.REFRESH_TOKEN_SECRET!,
  };
  const options = {
    access: { expiresIn: "15m" as const },
    refresh: { expiresIn: "7d" as const },
  };

  return jwt.sign(payload, secrets[secretType], options[secretType]);
};

// Helper function to create tokens with OTP/activation code
const createToken = (user: UserData, type: "activation" | "forgotPassword") => {
  const code = randomInt(100000, 999999);
  const tokenPayload: TokenPayload = {
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
    },
    code,
    type,
  };

  const secret =
    type === "activation"
      ? process.env.ACTIVATION_TOKEN!
      : process.env.FORGOT_PASSWORD_SECRET!;

  const expiresIn = type === "activation" ? "48h" : "5m";

  const token = jwt.sign(tokenPayload, secret, { expiresIn });
  return { token, code };
};

const registerUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fullName, userName, email, password, phoneNumber, kycCard, role } =
      req.body;

    // check if all fields are provided
    validateRequiredFields(
      { email, password, userName, fullName, phoneNumber, kycCard, role },
      ["email", "password", "userName", "fullName", "phoneNumber", "kycCard", "role"]
    );

    // check if username is already taken
    const usernameExist = await prisma.user.findUnique({
      where: { userName: userName },
    });

    if (usernameExist) {
      return next(new ErrorResponse("Username already taken", 400));
    }

    // check if phone number is already taken
    const phoneNumberExist = await prisma.user.findUnique({
      where: { phone: phoneNumber },
    })

    if(phoneNumberExist){
      return next(new ErrorResponse("Phone number already taken", 400));
    }

    // check if user already exists
    const userExist = await findUserByEmail(email);
    if (userExist) {
      return next(new ErrorResponse("User already exists", 400));
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // create user
      const user = await prisma.user.create({
        data: {
          fullName,
          userName,
          email,
          password: hashedPassword,
          phone: phoneNumber,
          kycCard,
          role,
          kycVerified: role === "ADMIN" ? true : false
        },
      });

      // create token
      const { token: activation_Token, code: activationCode } = createToken(
        {
          username: user.userName!,
          email: user.email,
          role: user.role
        },
        "activation"
      );

      console.log(`code: ${activationCode}`);
      // Crate A link and send it on mail to activate user
      res.status(201).json({
        success: true,
        message: "User Created Successfully",
      });
    } catch (error) {
      return next(new ErrorResponse(`Something went while creating user: ${error.message}`, 500));
    }
  } catch (error) {
    return next(new ErrorResponse(`Something Went Wrong : ${error}`, 500));
  }
};

const loginUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // check if email and password are provided
    validateRequiredFields({ email, password }, ["email", "password"]);

    // check if user exists
    const userExist = await findUserByEmail(email);
    if (!userExist) {
      return next(new ErrorResponse("User not found", 404));
    }

    // check if password is correct
    const isPasswordCorrect = await bcrypt.compare(
      password,
      userExist.password!
    );

    // check if password is correct
    if (!isPasswordCorrect) {
      return next(new ErrorResponse("Invalid Password", 400));
    }

    if(!userExist.kycVerified){
        return next(new ErrorResponse("User is not verified yet!", 403))
    }

    // set refresh token in cookie
    const userPayload = {
      id: userExist.id,
      email: userExist.email,
    };
    const accessToken = generateTokens(userPayload, "access");
    const refreshToken = generateTokens(userPayload, "refresh");

    // set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 1000, // 1 minute
      sameSite: "lax",
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

      const { password: _, ...userWithoutPassword } = userExist;

    // send response
    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: userWithoutPassword
    });
  } catch (error) {
    return next(
      new ErrorResponse(
        `Something went wrong while logging in user: ${error}`,
        500
      )
    );
  }
};

const forgotPassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // check if email is provided
    validateRequiredFields({ email }, ["email"]);

    // check if user exists
    const userExist = await findUserByEmail(email);
    if (!userExist) {
      throw new ErrorResponse("User not found", 404);
    }

    // create token
    const { token, code: otp } = createToken(
      {
        username: userExist.userName!,
        email: userExist.email,
        role: userExist.role
      },
      "forgotPassword"
    );

    // send email
    // sendEmail(
    //   userExist.email,
    //   otp,
    //   "Reset Password",
    //   "forgotpassword",
    //   userExist.username!
    // );

    res.status(200).json({
      token,
      message: "Your Forgot password request successful",
    });
  } catch (error) {
    return next(
      new ErrorResponse(
        `Something went wrong while processing forgot password: ${error}`,
        500
      )
    );
  }
};

const verifyOtp: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, otp } = req.body;

    validateRequiredFields({ token, otp }, ["token", "otp"]);

    // Check if token has already been used
    if (usedTokens.has(token)) {
      return next(
        new ErrorResponse(
          "This verification link has already been used. Please request a new one.",
          400
        )
      );
    }

    // check if token is valid
    const decoded = jwt.verify(
      token,
      process.env.FORGOT_PASSWORD_SECRET!
    ) as TokenPayload;

    // check if token is for forgot password
    if (!decoded || decoded.type !== "forgotPassword") {
      return next(new ErrorResponse("Invalid Token", 400));
    }

    // check if otp is valid
    if (decoded.code !== otp) {
      return next(new ErrorResponse("Invalid OTP", 400));
    }

    // Find user to verify they exist
    const user = await findUserByEmail(decoded.user.email);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Generate a new token for password reset with the same structure
    const resetToken = jwt.sign(
      {
        user: {
          username: user.userName!,
          email: user.email,
        },
        type: "forgotPassword",
      },
      process.env.FORGOT_PASSWORD_SECRET!,
      { expiresIn: "15m" }
    );

    // Mark the current token as used
    usedTokens.add(token);

    // Clean up old tokens (optional, to prevent memory leaks)
    if (usedTokens.size > 1000) {
      usedTokens.clear();
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token: resetToken,
      email: user.email,
    });
  } catch (error) {
    return next(
      new ErrorResponse("Something went wrong while OTP verification", 500)
    );
  }
};

const resetPassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;

    // check if token and password are provided
    validateRequiredFields({ token, password }, ["token", "password"]);

    // check if token is valid
    const decoded = jwt.verify(
      token,
      process.env.FORGOT_PASSWORD_SECRET!
    ) as TokenPayload;

    // check if token is for forgot password
    if (!decoded || decoded.type !== "forgotPassword") {
      return next(new ErrorResponse("Invalid Token", 400));
    }

    // check if user exists
    const user = await findUserByEmail(decoded.user.email);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // update user password
    try {
      const updatedUser = await prisma.user.update({
        where: { email: decoded.user.email },
        data: { password: hashedPassword },
      });
      res.status(200).json({
        success: true,
        message: "Password reset successfully",
        user: updatedUser,
      });
    } catch (error) {
      return next(
        new ErrorResponse("Something went while updating Password in Db", 500)
      );
    }
  } catch (error) {
    return next(
      new ErrorResponse(
        `Something went wrong while resetting password: ${error}`,
        500
      )
    );
  }
};

const resendVerificationOTP: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // check if email is provided
    validateRequiredFields({ email }, ["email"]);

    // check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // create token
    const { token: activation_Token, code: activationCode } = createToken(
      {
        username: user.userName!,
        email: user.email,
        role: user.role
      },
      "activation"
    );

    // send email
    // sendEmail(
    //   email,
    //   activationCode,
    //   "Verify Email",
    //   "verificationmail",
    //   user.username!
    // );

    res.status(200).json({
      success: true,
      message: "Verification OTP resent successfully",
      activationToken: activation_Token,
    });
  } catch (error) {
    return next(
      new ErrorResponse(
        `Something went wrong while resending verification OTP: ${error}`,
        500
      )
    );
  }
};

const resendForgotPasswordOTP: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // check if user exists
    validateRequiredFields({ email }, ["email"]);

    // check if user is verified
    const userExist = await findUserByEmail(email);
    if (!userExist) {
      throw new ErrorResponse("User not found", 404);
    }

    // create token
    const { token, code: otp } = createToken(
      {
        username: userExist.userName!,
        email: userExist.email,
        role: userExist.role
      },
      "forgotPassword"
    );

    // send email
    // sendEmail(
    //   userExist.email,
    //   otp,
    //   "Reset Password",
    //   "forgotpassword",
    //   userExist.username!
    // );

    res.status(200).json({
      success: true,
      message: "Forgot password OTP resent successfully",
      token,
    });
  } catch (error) {
    return next(
      new ErrorResponse(
        `Something went wrong while resending forgot password OTP: ${error}`,
        500
      )
    );
  }
};

// Refresh access token using refresh token
const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new ErrorResponse("Refresh token is required", 400));
    }

    try {
      // Verify the refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      ) as JwtPayload;

      // Get user from database to ensure they still exist
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          userName: true,
        },
      });

      if (!user) {
        return next(new ErrorResponse("User not found", 401));
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
      );

      res.status(200).json({
        success: true,
        message: "Access token refreshed successfully",
        accessToken: newAccessToken,
      });
    } catch (jwtError) {
      return next(new ErrorResponse("Invalid or expired refresh token", 401));
    }
  } catch (error) {
    return next(new ErrorResponse("Token refresh failed", 500));
  }
};

export {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyOtp,
  resendVerificationOTP,
  resendForgotPasswordOTP,
  refreshAccessToken,
};
