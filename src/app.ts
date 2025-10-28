import express, { Application } from "express";
import cors from "cors";
import businessDateRouter from "./routes/businessDate.routes";

export const startServer = (): void => {
  const app: Application = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/business-date", businessDateRouter);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};
