import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "KL Perfumes RD — Perfumería de Lujo en República Dominicana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0c10 0%, #1a1030 50%, #0f1117 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Perfume bottle emoji */}
        <div style={{ fontSize: 100, marginBottom: 24 }}>🪷</div>

        {/* Brand name */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <span style={{ color: "#f5f0e8", fontSize: 72, fontWeight: 300, letterSpacing: 2 }}>
            KL
          </span>
          <span
            style={{
              background: "linear-gradient(90deg, #00d4ff, #7c3aed)",
              backgroundClip: "text",
              color: "transparent",
              fontSize: 72,
              fontWeight: 700,
            }}
          >
            Perfumes
          </span>
          <span style={{ color: "#f5f0e8", fontSize: 72, fontWeight: 300 }}>RD</span>
        </div>

        {/* Tagline */}
        <p
          style={{
            color: "rgba(245,240,232,0.55)",
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Perfumería de Lujo · República Dominicana
        </p>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #00d4ff, #7c3aed, #10b981)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
