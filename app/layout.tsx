import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ChatBot from "@/components/ChatBot";
import { CartProvider } from "@/lib/cart";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://klperfumesrd.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KL Perfumes RD | Perfumería de Lujo en República Dominicana",
    template: "%s | KL Perfumes RD",
  },
  description:
    "Perfumes originales y decants de las mejores casas: Lattafa, Maison Alhambra, Rasasi, Dior, Chanel y más. Envíos a toda República Dominicana.",
  keywords: [
    "perfumes República Dominicana",
    "decants perfume RD",
    "Lattafa",
    "Maison Alhambra",
    "perfumería lujo Santo Domingo",
    "fragancias originales",
  ],
  openGraph: {
    type: "website",
    locale: "es_DO",
    siteName: "KL Perfumes RD",
    title: "KL Perfumes RD | Perfumería de Lujo en República Dominicana",
    description:
      "Más de 650 fragancias originales y decants. Envíos a toda República Dominicana.",
  },
  twitter: {
    card: "summary_large_image",
    title: "KL Perfumes RD",
    description: "Perfumería de lujo en República Dominicana. Lattafa, Maison Alhambra, Rasasi y más.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <CartProvider>
          <Header />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
          <ChatBot />
        </CartProvider>
      </body>
    </html>
  );
}
