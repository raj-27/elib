import express, { Request, Response } from "express";

const app = express();

// Routes
// HTTP methods: GET,POST,PATCH,DELETE
app.get("/", (req: Request, res: Response, next) => {
  res.json({
    message: "Welcome to elib apis",
  });
});

export default app;
