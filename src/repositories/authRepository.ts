import UserModel from "../models/User";
import { IUser } from "../models/User";

// Finds a user by email.
export const findUserByEmail = async (
  email: string
): Promise<IUser | null> => {
  const users = await UserModel.find({});
  console.log("ALL USERS:", users);
  console.log('model collection name',UserModel.collection.name);
  return UserModel.findOne({ email }).exec();
};

// Finds a user by id
export const findUserById = async (id: string): Promise<IUser | null> => {
  return UserModel.findOne({ _id: id }).exec();
};

// Creates a new user
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

