import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS =
  process.env.RESEND_FROM ?? "onboarding@resend.dev";
const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "18090000000";

function fmt(value: number): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function buildHtml(pedido: {
  pedidoId: number;
  total: unknown;
  cliente: { nombre: string; email: string } | null;
  detalles: Array<{
    cantidad: number;
    precioUnitario: unknown;
    subtotal: unknown;
    variante: {
      tipoVariante: { nombre: string };
      producto: { nombre: string; marca: { nombre: string } };
    };
  }>;
}): string {
  const total = fmt(Number(pedido.total));
  const clientNombre = pedido.cliente?.nombre ?? "Cliente";
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola, tengo una pregunta sobre mi pedido #${pedido.pedidoId}`)}`;

  const itemsHtml = pedido.detalles
    .map(
      (d, i) => `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:12px 0;${
        i < pedido.detalles.length - 1 ? "border-bottom:1px solid #f0ede8;" : ""
      }">
        <div>
          <p style="margin:0;font-size:14px;font-weight:600;color:#0e1116;line-height:1.3;">
            ${d.variante.producto.nombre}
          </p>
          <p style="margin:3px 0 0;font-size:12px;color:#9ca3af;">
            ${d.variante.producto.marca.nombre} &middot; ${d.variante.tipoVariante.nombre} &times; ${d.cantidad}
          </p>
        </div>
        <p style="margin:0;font-size:14px;font-weight:600;color:#0e1116;white-space:nowrap;padding-left:16px;">
          ${fmt(Number(d.subtotal ?? Number(d.precioUnitario) * d.cantidad))}
        </p>
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Pedido #${pedido.pedidoId} confirmado</title>
</head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">

    <!-- Logo -->
    <div style="text-align:center;padding:32px 0 20px;">
      <p style="margin:0;font-size:22px;font-weight:700;color:#0e1116;letter-spacing:-0.3px;">
        KL <span style="color:#00b4cc;">Perfumes</span> RD
      </p>
    </div>

    <!-- Card -->
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.07);">

      <!-- Gradient accent bar -->
      <div style="height:4px;background:linear-gradient(90deg,#00b4cc,#10d09e);"></div>

      <!-- Heading -->
      <div style="padding:32px 28px 20px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#00b4cc;">
          Pedido Confirmado
        </p>
        <h1 style="margin:0 0 14px;font-size:26px;font-weight:700;color:#0e1116;line-height:1.2;">
          ¡Gracias por tu pedido!
        </h1>
        <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.65;">
          Hola <strong style="color:#0e1116;">${clientNombre}</strong>, hemos confirmado tu
          pedido <strong style="color:#0e1116;">#${pedido.pedidoId}</strong>.
          Nos pondremos en contacto contigo para coordinar la entrega.
        </p>
      </div>

      <!-- Divider -->
      <div style="height:1px;background:#f0ede8;margin:0 28px;"></div>

      <!-- Items -->
      <div style="padding:20px 28px 8px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;">
          Productos
        </p>
        ${itemsHtml}
      </div>

      <!-- Divider -->
      <div style="height:1px;background:#f0ede8;margin:0 28px;"></div>

      <!-- Total -->
      <div style="padding:20px 28px;display:flex;justify-content:space-between;align-items:center;">
        <p style="margin:0;font-size:14px;color:#6b7280;">Total</p>
        <p style="margin:0;font-size:22px;font-weight:700;color:#0e1116;">${total}</p>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;padding:28px 0 20px;">
      <p style="margin:0 0 14px;font-size:13px;color:#6b7280;">¿Tienes alguna pregunta sobre tu pedido?</p>
      <a href="${waUrl}"
         style="display:inline-block;background:#25D366;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 28px;border-radius:12px;">
        Contáctanos por WhatsApp
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-bottom:28px;">
      <p style="margin:0;font-size:11px;color:#b0aaa3;">
        KL Perfumes RD &middot; República Dominicana
      </p>
      <p style="margin:4px 0 0;font-size:11px;color:#b0aaa3;">
        Fragancias originales y decants de las mejores casas del mundo
      </p>
    </div>

  </div>
</body>
</html>`;
}

export async function sendOrderConfirmation(pedidoId: number): Promise<void> {
  if (!RESEND_KEY || RESEND_KEY.startsWith("pendiente")) {
    console.log(
      `[email] RESEND_API_KEY no configurado — omitiendo confirmación para pedido #${pedidoId}`
    );
    return;
  }

  const pedido = await prisma.pedido.findUnique({
    where: { pedidoId },
    include: {
      cliente: true,
      detalles: {
        include: {
          variante: {
            include: {
              tipoVariante: true,
              producto: { include: { marca: true } },
            },
          },
        },
        orderBy: { detalleId: "asc" },
      },
    },
  });

  if (!pedido?.cliente?.email) {
    console.log(
      `[email] Pedido #${pedidoId} sin email de cliente — omitiendo envío`
    );
    return;
  }

  const resend = new Resend(RESEND_KEY);
  const html = buildHtml(pedido);

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: pedido.cliente.email,
    subject: `Tu pedido #${pedido.pedidoId} ha sido confirmado — KL Perfumes RD`,
    html,
  });

  if (error) {
    console.error(`[email] Error al enviar confirmación pedido #${pedidoId}:`, error);
  } else {
    console.log(`[email] Confirmación enviada a ${pedido.cliente.email} (pedido #${pedidoId})`);
  }
}
