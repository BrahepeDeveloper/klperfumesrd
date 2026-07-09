// ── Store contact constants ────────────────────────────────────────────────
// Update WA_NUMBER when the client provides the real WhatsApp number.
// Format: country code + number, no spaces or hyphens (e.g. "18291234567").
export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "18090000000";
export const STORE_EMAIL = process.env.NEXT_PUBLIC_STORE_EMAIL ?? "info@klperfumesrd.com";
export const STORE_PHONE_DISPLAY = process.env.NEXT_PUBLIC_STORE_PHONE_DISPLAY ?? "+1 (809) 000-0000";

export const waLink = (message?: string) =>
  message
    ? `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${WA_NUMBER}`;
