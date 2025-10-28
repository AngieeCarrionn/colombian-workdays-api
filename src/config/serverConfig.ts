export interface ServerConfig {
  port: number;
}

export const createServerConfig = (): ServerConfig => ({
  port: Number(process.env.PORT) || 3000,
});
