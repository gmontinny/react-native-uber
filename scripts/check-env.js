const { URL } = require("node:url");

// Confere as configurações sem exibir chaves, senhas ou URLs de conexão.
const required = [
  "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "EXPO_PUBLIC_PLACES_API_KEY",
  "EXPO_PUBLIC_DIRECTIONS_API_KEY",
  "EXPO_PUBLIC_GEOAPIFY_API_KEY",
  "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "DATABASE_URL",
];
let valid = true;
for (const name of required) {
  const present = Boolean(process.env[name]?.trim());
  console.log(`${present ? "OK" : "AUSENTE"}: ${name}`);
  if (!present) valid = false;
}
const driver = process.env.DATABASE_DRIVER || "neon";
if (!["postgres", "neon"].includes(driver)) {
  console.error("DATABASE_DRIVER deve ser postgres ou neon.");
  valid = false;
}
if (driver === "neon" && !process.env.DOCKER_DATABASE_URL?.trim()) {
  console.log("Para usar Neon no Docker, preencha também DOCKER_DATABASE_URL.");
}
try {
  const url = new URL(
    process.env.EXPO_PUBLIC_SERVER_URL || "http://localhost:8081",
  );
  if (!["http:", "https:"].includes(url.protocol)) throw new Error();
  console.log("OK: formato de EXPO_PUBLIC_SERVER_URL");
} catch {
  console.error("EXPO_PUBLIC_SERVER_URL precisa ser uma URL HTTP válida.");
  valid = false;
}
console.log(
  valid
    ? "Configuração preenchida. A conectividade será verificada ao usar os serviços."
    : "Preencha os campos ausentes no .env e execute novamente.",
);
process.exitCode = valid ? 0 : 1;
