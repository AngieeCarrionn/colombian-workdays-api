import { Request, Response, NextFunction } from "express";
interface ApiError {
  status?: number;
  error?: string;
  message?: string;
}
export const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  const error = err.error || "InternalError";
  const message = err.message || "Error interno del servidor";

  res.status(status).json({ error, message });
};
