import express from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/globalErrorhandler";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";
import { config } from "./config/config";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: config.frontedDomain,
  })
);

app.use("/api/user", userRouter);
app.use("/api/books", bookRouter);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
