import app from "./src/app";
import { config } from "./src/config/config";
import connectDB from "./src/config/db";

const startServer = async () => {
  connectDB(); //Connecting to database
  const PORT = config.port || 3000;
  app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
  });
};

startServer();
