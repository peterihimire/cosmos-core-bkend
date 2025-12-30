import UserModel from "../models/User";
import { IUser } from "../models/User";

/**
 * Finds a user by email.
 * @param email The email of the user to find.
 * @returns Promise<IUser | null>
 */
export const findUserByEmail = async (
  email: string
): Promise<IUser | null> => {
  const users = await UserModel.find({});
  console.log("ALL USERS:", users);
  console.log('model collection name',UserModel.collection.name);
  return UserModel.findOne({ email }).exec();
};

/**
 * Finds a user by id.
 * @param id The id of the user to find.
 * @returns Promise<IUser | null>
 */
export const findUserById = async (id: string): Promise<IUser | null> => {
  return UserModel.findOne({ _id: id }).exec();
};

/**
 * Creates a new user.
 * @param data The data of the user to create.
 * @returns Promise<IUser | null>
 */
export const createUser = async (data: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}): Promise<IUser | null> => {
  const newUser = new UserModel({
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    password: data.password,
  });

  await newUser.save();
  return newUser;
};

