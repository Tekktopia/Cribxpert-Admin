// utils/csv.ts — tiny dependency-free CSV builder + browser download

type Cell = string | number | boolean | null | undefined;

function escapeCell(value: Cell): string {
  const s = value === null || value === undefined ? "" : String(value);
  // Quote if it contains comma, quote, or newline; escape inner quotes.
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Build a CSV string from an array of row objects.
 * `columns` controls order + header labels.
 */
export function toCsv<T extends Record<string, Cell>>(
  rows: T[],
  columns: { key: keyof T; label: string }[],
): string {
  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCell(row[c.key])).join(","))
    .join("\r\n");
  return `${header}\r\n${body}`;
}

/** Trigger a client-side download of `content` as `filename`. */
export function downloadCsv(filename: string, content: string): void {
  // Prepend BOM so Excel reads UTF-8 correctly.
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Convenience: build + download in one call. */
export function exportCsv<T extends Record<string, Cell>>(
  filename: string,
  rows: T[],
  columns: { key: keyof T; label: string }[],
): void {
  downloadCsv(filename, toCsv(rows, columns));
}
