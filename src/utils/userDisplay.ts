// =====================================================
// File: src/utils/userDisplay.ts
// =====================================================
export function safeText(value: unknown, fallback = "—"): string {
  if (typeof value !== "string") return fallback;
  const t = value.trim();
  return t ? t : fallback;
}

export function getInitials(nameOrEmail: unknown, fallback = "U"): string {
  const text = safeText(nameOrEmail, "");
  if (!text) return fallback;

  // If it's an email, use first 2 chars of local-part as initials fallback
  if (text.includes("@")) {
    const local = text.split("@")[0] ?? "";
    const a = (local[0] ?? "").toUpperCase();
    const b = (local[1] ?? "").toUpperCase();
    return (a + b).trim() || fallback;
  }

  const parts = text.split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => (p[0] ?? "").toUpperCase())
    .join("");

  return initials || fallback;
}

/**
 * Avoid hitting Vite with fake placeholder routes like /api/placeholder/32/32
 */
export function normalizeAvatarSrc(src: unknown): string | undefined {
  if (typeof src !== "string") return undefined;
  const t = src.trim();
  if (!t) return undefined;
  if (t.startsWith("/api/placeholder")) return undefined;
  return t;
}