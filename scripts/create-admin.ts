/**
 * Crea el primer usuario administrador.
 * Uso: npx tsx scripts/create-admin.ts <email> <password>
 * Ejemplo: npx tsx scripts/create-admin.ts admin@klperfumesrd.com MiContraseña123
 */
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error("Uso: npx tsx scripts/create-admin.ts <email> <password>");
    process.exit(1);
  }

  const existing = await prisma.usuario.findFirst({ where: { email: email.toLowerCase() } });
  if (existing) {
    console.log(`✓ Usuario ${email} ya existe (ID: ${existing.usuarioId})`);
    process.exit(0);
  }

  const user = await prisma.usuario.create({
    data: {
      nombre: "Administrador",
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      rol: "SuperAdmin",
    },
  });

  console.log(`✓ Admin creado: ${user.email} (ID: ${user.usuarioId})`);
}

main().finally(() => prisma.$disconnect());
