import { neon } from "@neondatabase/serverless";
import postgres from "postgres";

// Reutiliza a conexão durante as recargas do servidor de desenvolvimento.
const databaseGlobal = globalThis as typeof globalThis & {
  localDatabase?: ReturnType<typeof postgres>;
};
type SqlValue = string | number | boolean | null;

export function getDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Defina DATABASE_URL no arquivo .env.");
  if (process.env.DATABASE_DRIVER === "postgres") {
    const client = (databaseGlobal.localDatabase ??= postgres(url, {
      max: 10,
    }));
    return async (strings: TemplateStringsArray, ...values: SqlValue[]) =>
      client(strings, ...values);
  }
  const client = neon(url);
  return async (strings: TemplateStringsArray, ...values: SqlValue[]) =>
    client(strings, ...values);
}
