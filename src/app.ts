
/**
 * @fileoverview Configuración principal del servidor Express.
 * Incluye middlewares globales, rutas principales y manejo de errores.
 */
import express from "express";
import cors from "cors";
import businessDateRouter from "./routes/businessDate.routes";
import { errorHandler } from "./types/errors";

// Crear instancia de la aplicación Express
export const app = express();
// Habilitar CORS para permitir solicitudes desde otros orígenes
app.use(cors());
// Middleware para parsear cuerpos JSON en las solicitudes
app.use(express.json());
// Evitar almacenamiento en caché de las respuestas
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
});
// Registrar rutas principales del módulo "business-date"
app.use("/api/business-date", businessDateRouter);
// Middleware global para manejo de errores
app.use(errorHandler);
/**
 * Inicia el servidor en el puerto especificado por la variable de entorno PORT.
 * Si no está definida, usa el puerto 3000 por defecto.
 */
export const startServer = () => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
};
