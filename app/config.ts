const PORT = Deno.env.get("PORT") ?? 9999;

const DB_NAME = Deno.env.get("DB_NAME") ?? "rinha";
const DB_HOST = Deno.env.get("DB_HOST") ?? "0.0.0.0";
const DB_USER = Deno.env.get("DB_USER") ?? "rinha";
const DB_PASS = Deno.env.get("DB_PASS") ?? "rinha";
const DB_PORT = Deno.env.get("DB_PORT") ?? 5432;
const DB_POOL_SIZE = Deno.env.get("DB_POOL_SIZE") || 5;

export const config = {
  api: {
    port: +PORT,
  },
  postgres: {
    database: DB_NAME,
    hostname: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    poolSize: +DB_POOL_SIZE,
    port: +DB_PORT
  },
};