export function formatTimeShort(dateIso: string): string {
  try {
    const d = new Date(dateIso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function textPreview(text: string, max = 36): string {
  const t = (text || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (!parts.length) return "";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
