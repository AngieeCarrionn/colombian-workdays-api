/**
 * Configuración del servidor.
 *
 * Contiene la configuración mínima requerida para iniciar la API.
 */
export interface ServerConfig {
  /** Puerto en el que escuchará el servidor (ej. 3000) */
  port: number;
}

/**
 * Crea la configuración del servidor basada en variables de entorno.
 * - Lee `process.env.PORT` y lo convierte a número.
 * - Si no se especifica, devuelve el puerto por defecto `3000`.
 *
 * @returns {ServerConfig} Configuración lista para usar por el arranque del servidor
 */
export const createServerConfig = (): ServerConfig => ({
  port: Number(process.env.PORT) || 3000,
});
