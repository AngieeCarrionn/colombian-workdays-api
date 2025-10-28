import express, { Application } from "express";
import cors from "cors";
import businessDateRouter from "./routes/businessDate.routes";
import { errorHandler } from "./types/errors"; // middleware de errores

export const startServer = (): void => {
  const app: Application = express();

  // Habilitar CORS
  app.use(cors());

  // Parseo de JSON
  app.use(express.json());

  // Evitar caché en desarrollo para que siempre retorne el código de estado correcto
  app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });

  // Rutas de la API
  app.use("/api/business-date", businessDateRouter);

  // Middleware de manejo de errores
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};
