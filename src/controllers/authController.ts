import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { httpStatusCodes } from "../utils/http-status-codes";
import { RegisterUserDTO, LoginUserDTO } from "../types/authDto";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
} from "../services/authService";

// Registers a new user.
export const register: RequestHandler = async (req, res, next) => {
  const { firstname, lastname, email, password }: RegisterUserDTO = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const createdUser = await registerUser({
      firstname,
      lastname,
      email,
      password,
    });

    const userObject = createdUser.toObject();
    const { password: _, ...userData } = userObject;

    res.status(httpStatusCodes.CREATED).json({
      status: "success",
      msg: "Signup successful!",
      data: { ...userData },
    });
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};

// Logs in a user and generates tokens.
export const login: RequestHandler = async (req, res, next) => {
  const { email, password }: LoginUserDTO = req.body;

  try {
    const { accessToken, refreshToken, user } = await loginUser({
      email,
      password,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
    });

    const userObject = user.toObject();
    const { password: _, __v, ...userData } = userObject;

    res.status(httpStatusCodes.OK).json({
      status: "success",
      msg: "Signin successful",
      data: { ...userData, accessToken },
    });
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};

// Refreshes access token using the provided refresh token.
export const refresh: RequestHandler = async (req, res, next) => {
  // const { refreshToken } = req.cookies.refreshToken;

  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(httpStatusCodes.UNAUTHORIZED).json({
        status: "error",
        msg: "Refresh token missing",
      });
    }

    const { accessToken, newRefreshToken } = await refreshAccessToken(
      refreshToken
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5 * 24 * 60 * 60 * 1000,
    });

    res.status(httpStatusCodes.OK).json({
      status: "success",
      msg: "Token refreshed successfully",
      data: { accessToken },
    });
  } catch (error: any) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};

// Logs out a user by clearing the refresh token cookie.
export const logout: RequestHandler = (req, res) => {
  res
    .clearCookie("refreshToken", {
      secure: false,
      sameSite: "lax",
    })
    .status(httpStatusCodes.OK)
    .json({
      status: "success",
      msg: "Signout successful.",
    });
};
