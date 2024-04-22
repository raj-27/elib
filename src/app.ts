import express, { Request, Response } from "express";
import createHttpError from "http-errors";
import globalErrorHandler from "./middlewares/globalErrorhandler";

const app = express();

// Routes
// HTTP methods: GET,POST,PATCH,DELETE
app.get("/", (req: Request, res: Response, next) => {
  const error = createHttpError(400, "Something went wrong");
  throw error;
  res.json({
    message: "Welcome to elib apis",
  });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
