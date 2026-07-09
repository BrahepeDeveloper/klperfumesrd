import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth.server";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = { title: "Admin | KL Perfumes RD" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Login page: render with no admin chrome or auth check
  // (middleware handles redirecting authenticated users away from login)
  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  // All other admin pages: load the current user for the nav
  // Middleware already enforced auth — this is just for display data
  const userId = await getSessionUserId();
  if (!userId) return <>{children}</>;

  const user = await prisma.usuario.findUnique({
    where: { usuarioId: userId },
    select: { nombre: true, email: true, rol: true },
  });
  if (!user) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <AdminNav user={user} />
      <div className="flex-1 overflow-auto">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
