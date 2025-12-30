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

/**
 * Registers a new user.
 * @param data The data of the user to create.
 * @returns Promise<IUser | null>
 */
export const registerUser = async (data: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}): Promise<IUser | null> => {
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

  return newUser;
};

/**
 * Logs in a user and returns JWT tokens.
 * @param username The username of the user to login.
 * @param password The password of the user to login.
 * @returns Promise<{ accessToken: string; refreshToken: string; user: IUser }>
 */
export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken: string; user: IUser }> => {
  const foundUser = await authRepository.findUserByEmail(data.email);
  console.log("Found user:", foundUser);
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
    { expiresIn: "1h" } // Access token expiration
  );

  const refreshToken = sign(
    { id: foundUser.id, email: foundUser.email },
    JWT_REFRESH_KEY,
    { expiresIn: "7d" } // Refresh token expiration
  );

  return { accessToken, refreshToken, user: foundUser };
};

/**
 * Refreshes the access token.
 * @param refreshToken The refresh token to be used.
 * @returns Promise<{ accessToken: string }>
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string; newRefreshToken: string }> => {
  try {
    const decoded = verify(refreshToken, JWT_REFRESH_KEY) as {
      id: string;
      username: string;
    };
    const foundUser = await authRepository.findUserById(decoded.id);

    if (!foundUser) {
      throw new BaseError(
        "Invalid refresh token",
        httpStatusCodes.UNAUTHORIZED
      );
    }

    const newAccessToken = sign(
      { id: foundUser.id, username: foundUser.email },
      JWT_KEY,
      { expiresIn: "1h" }
    );

    const newRefreshToken = sign(
      { id: foundUser.id, username: foundUser.email },
      JWT_REFRESH_KEY,
      { expiresIn: "7d" }
    );

    return { accessToken: newAccessToken, newRefreshToken };
  } catch (error) {
    throw new BaseError(
      "Invalid or expired refresh token",
      httpStatusCodes.UNAUTHORIZED
    );
  }
};
