import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { sign, verify } from "jsonwebtoken";
import { IUser } from "../models/User";
import * as authRepository from "../repositories/authRepository";
import BaseError from "../utils/base-error";
import { httpStatusCodes } from "../utils/http-status-codes";

dotenv.config();

const { JWT_KEY, JWT_REFRESH_KEY } = process.env;

if (!JWT_KEY || !JWT_REFRESH_KEY) {
  throw new Error(
    "JWT_KEY or JWT_REFRESH_KEY is not defined in the environment variables"
  );
}

// Register a new user
export const registerUser = async (data: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}): Promise<IUser> => {
  const existingUser = await authRepository.findUserByEmail(data.email);
  if (existingUser) {
    throw new BaseError(
      "Account already exists, login instead!",
      httpStatusCodes.CONFLICT
    );
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(data.password, salt);

  const newUser = await authRepository.createUser({
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    password: hashedPassword,
  });

  if (!newUser) {
    throw new BaseError(
      "Failed to create user",
      httpStatusCodes.INTERNAL_SERVER
    );
  }

  return newUser;
};

// Login user and generate tokens
export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken: string; user: IUser }> => {
  const foundUser = await authRepository.findUserByEmail(data.email);

  if (!foundUser) {
    throw new BaseError(
      "Error logging in, check credentials!",
      httpStatusCodes.CONFLICT
    );
  }

  const isPasswordMatch = await bcrypt.compare(
    data.password,
    foundUser.password
  );
  if (!isPasswordMatch) {
    throw new BaseError(
      "Wrong password or email!",
      httpStatusCodes.UNAUTHORIZED
    );
  }

  const accessToken = sign(
    { id: foundUser.id, email: foundUser.email, role: foundUser.role },
    JWT_KEY,
    { expiresIn: "2h" }
  );

  const refreshToken = sign(
    { id: foundUser.id, email: foundUser.email, role: foundUser.role },
    JWT_REFRESH_KEY,
    { expiresIn: "5d" }
  );

  return { accessToken, refreshToken, user: foundUser };
};

// Refresh access token using refresh token
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string; newRefreshToken: string }> => {
  try {
    const decoded = verify(refreshToken, JWT_REFRESH_KEY) as {
      id: string;
      email: string;
      role: string;
    };
    const foundUser = await authRepository.findUserById(decoded.id);

    if (!foundUser) {
      throw new BaseError(
        "Invalid refresh token",
        httpStatusCodes.UNAUTHORIZED
      );
    }

    const newAccessToken = sign(
      { id: foundUser.id, email: foundUser.email, role: foundUser.role },
      JWT_KEY,
      { expiresIn: "2h" }
    );

    const newRefreshToken = sign(
      { id: foundUser.id, email: foundUser.email, role: foundUser.role },
      JWT_REFRESH_KEY,
      { expiresIn: "5d" }
    );

    return { accessToken: newAccessToken, newRefreshToken };
  } catch (error) {
    throw new BaseError(
      "Invalid or expired refresh token",
      httpStatusCodes.UNAUTHORIZED
    );
  }
};
