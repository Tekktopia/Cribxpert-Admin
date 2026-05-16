// utils/sla.ts — client-side SLA computation (no DB columns required)
//
// Policy (per business decision):
//   • First-response SLA target  = 4 hours from ticket creation
//   • Resolution SLA target      = 24 hours from ticket creation
// "Due soon" = within 30 minutes of breaching.
//
// Everything is derived from data we already have (created_at, status, and —
// when available — the first outbound message timestamp), so no migration or
// edge-function change is needed.

export const RESPONSE_TARGET_MIN = 4 * 60; // 4 hours
export const RESOLUTION_TARGET_MIN = 24 * 60; // 24 hours
const SOON_WINDOW_MIN = 30;

export type SlaState = "met" | "ontrack" | "soon" | "breached";

export interface SlaResult {
  state: SlaState;
  /** ISO time the clock is/was due. */
  dueAt: string;
  /** Minutes remaining (negative = overdue by N minutes). */
  remainingMin: number;
  /** Short human label, e.g. "2h 14m left" or "Breached 35m". */
  label: string;
}

function fmtMins(mins: number): string {
  const m = Math.abs(Math.round(mins));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h > 0) return `${h}h ${r}m`;
  return `${r}m`;
}

function evaluate(
  createdAt: string,
  targetMin: number,
  stoppedAt: string | null,
  now: number,
): SlaResult {
  const created = new Date(createdAt).getTime();
  const dueMs = created + targetMin * 60_000;
  const dueAt = new Date(dueMs).toISOString();

  // Clock stopped (response given / ticket resolved) — judge against stop time.
  if (stoppedAt) {
    const stopped = new Date(stoppedAt).getTime();
    const overshoot = (stopped - dueMs) / 60_000;
    return {
      state: overshoot > 0 ? "breached" : "met",
      dueAt,
      remainingMin: -overshoot,
      label: overshoot > 0 ? `Missed by ${fmtMins(overshoot)}` : "Met",
    };
  }

  const remainingMin = (dueMs - now) / 60_000;
  if (remainingMin < 0) {
    return { state: "breached", dueAt, remainingMin, label: `Overdue ${fmtMins(remainingMin)}` };
  }
  if (remainingMin <= SOON_WINDOW_MIN) {
    return { state: "soon", dueAt, remainingMin, label: `${fmtMins(remainingMin)} left` };
  }
  return { state: "ontrack", dueAt, remainingMin, label: `${fmtMins(remainingMin)} left` };
}

export interface SlaInput {
  createdAt: string;
  status: string; // pending | in-progress | resolved | closed
  /** First outbound reply time, if known (TicketDetails has this). */
  firstResponseAt?: string | null;
  /** When the ticket was resolved/closed, if known (falls back to updatedAt). */
  resolvedAt?: string | null;
}

export interface TicketSla {
  response: SlaResult;
  resolution: SlaResult;
  /** True if either clock is breached and still running. */
  anyBreached: boolean;
}

export function computeSla(input: SlaInput, now: number = Date.now()): TicketSla {
  const isResolved = input.status === "resolved" || input.status === "closed";

  // Response clock stops at the first reply. If we don't have the exact
  // timestamp but the ticket has clearly moved past "pending", treat it as
  // responded at resolvedAt (best available proxy) so we don't false-alarm.
  const responseStoppedAt =
    input.firstResponseAt ??
    (input.status !== "pending" ? (input.resolvedAt ?? null) : null);

  const response = evaluate(input.createdAt, RESPONSE_TARGET_MIN, responseStoppedAt, now);
  const resolution = evaluate(
    input.createdAt,
    RESOLUTION_TARGET_MIN,
    isResolved ? (input.resolvedAt ?? null) : null,
    now,
  );

  const anyBreached =
    (response.state === "breached" && !responseStoppedAt) ||
    (resolution.state === "breached" && !isResolved);

  return { response, resolution, anyBreached };
}

/** Tailwind classes for an SLA badge. */
export function slaBadgeClass(state: SlaState): string {
  switch (state) {
    case "breached": return "bg-red-100 text-red-700 border-red-200";
    case "soon":     return "bg-amber-100 text-amber-800 border-amber-200";
    case "met":      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:         return "bg-gray-100 text-gray-600 border-gray-200";
  }
}
