import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { verify } from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
  userId: string;
}
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");
  if (!token) {
    return next(createHttpError(401, "Authorization token is required."));
  }

  try {
    /* This part of the code is responsible for verifying the authorization token sent in the request.
   Here's a breakdown of what each step is doing: */
    const parsedToken = token;
    const decoded = verify(parsedToken, config.jwtSecret as string);
    console.log(decoded);
    const _req = req as AuthRequest;
    _req.userId = decoded.sub as string;
    next();
  } catch (err) {
    return next(createHttpError(401, "Token expired."));
  }
};

export default authenticate;
