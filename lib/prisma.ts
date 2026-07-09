import { PrismaClient } from "@prisma/client";

// Evita crear una nueva conexión a SQL Server en cada hot-reload de Next.js
// en desarrollo (App Router recarga módulos con frecuencia).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
