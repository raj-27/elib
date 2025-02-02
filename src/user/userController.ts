import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import userModel from "./userModel";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  console.log({ name, email, password });

  // Validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }
  // Database call
  try {
    const user = await userModel.findOne({ email });

    if (user) {
      const error = createHttpError(400, "User already exist with this email");
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Error while getting user"));
  }

  //   Password hash
  /* The code snippet you provided is responsible for creating a new user in the database after hashing
  the user's password using bcrypt. */
  const hashPassword = await bcrypt.hash(password, 10);

  // Process
  let newUser: User;
  try {
    newUser = await userModel.create({
      name,
      email,
      password: hashPassword,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating user"));
  }

  try {
    // Token Generation JWT
    /* This line of code is generating a JSON Web Token (JWT) for the newly created user. */
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });
    // Response
    res.status(201).json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(500, "Error while signing the jwt token"));
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      const error = createHttpError(400, "User does not exist with this email");
      return next(error);
    }
    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password as string
    );

    if (!isPasswordMatch) {
      const error = createHttpError(400, "Username or password is incorrect");
      return next(error);
    }
    try {
      const token = sign({ sub: user._id }, config.jwtSecret as string, {
        expiresIn: "7d",
      });
      res.status(200).json({ accessToken: token });
    } catch (err) {
      const error = createHttpError("400", "Error while generating toke");
      return next(error);
    }
  } catch (err) {
    const error = createHttpError(400, "Error while login with user");
    return next(error);
  }
};

export { createUser, loginUser };
