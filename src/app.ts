import express, { Request, Response } from "express";
import createHttpError from "http-errors";
import globalErrorHandler from "./middlewares/globalErrorhandler";
import userRouter from "./user/userRouter";

const app = express();

// Routes
// HTTP methods: GET,POST,PATCH,DELETE
app.get("/", (req: Request, res: Response, next) => {
  // const error = createHttpError(400, "Something went wrong");
  // throw error;
  res.json({
    message: "Welcome to elib apis",
  });
});

app.use("/api/user", userRouter);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
