import express, { Application } from "express";
import cors from "cors";
import businessDateRouter from "./routes/businessDate.routes";
import { errorHandler } from "./types/errors"; // importar middleware

export const startServer = (): void => {
  const app: Application = express();

  app.use(cors());
  app.use(express.json());

  // Rutas
  app.use("/api/business-date", businessDateRouter);

  // Middleware de manejo de errores
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};
