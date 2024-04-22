import app from "./src/app";
import { config } from "./src/config/config";

const startServer = () => {
  const PORT = config.port || 3000;
  app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
  });
};

startServer();
