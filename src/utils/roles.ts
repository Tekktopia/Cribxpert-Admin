// utils/roles.ts — role-based access helpers (DB role strings, lowercase)

/** Platform-wide admins with full access. */
export const FULL_ACCESS_ROLES = ["superadmin", "admin"] as const;

/** Group supervisors — manage their group, can export. */
export const SUPERVISOR_ROLES = [
  "csr_admin",
  "finance_admin",
  "group_supervisor",
] as const;

/** Front-line agents — work tickets, cannot export or manage shared config. */
export const AGENT_ROLES = [
  "csr_agent",
  "finance_agent",
  "group_agent",
] as const;

function norm(role?: string | null): string {
  return (role ?? "").toLowerCase().trim();
}

/** SuperAdmin / Admin only. */
export function isFullAccess(role?: string | null): boolean {
  return (FULL_ACCESS_ROLES as readonly string[]).includes(norm(role));
}

/** Supervisor of a group (csr_admin / finance_admin / group_supervisor). */
export function isSupervisor(role?: string | null): boolean {
  return (SUPERVISOR_ROLES as readonly string[]).includes(norm(role));
}

/**
 * Who may export CSV (tickets / ratings) and manage shared config such as
 * canned responses: SuperAdmin, Admin and any Supervisor. Agents may not.
 */
export function canExport(role?: string | null): boolean {
  return isFullAccess(role) || isSupervisor(role);
}

/** Alias — same gate is used for managing canned responses. */
export const canManageCannedResponses = canExport;

/** Front-line agent (csr_agent / finance_agent / group_agent). */
export function isAgent(role?: string | null): boolean {
  return (AGENT_ROLES as readonly string[]).includes(norm(role));
}

/**
 * Who may (re)assign a ticket's group/agent and change priority:
 * SuperAdmin, Admin and Supervisors. Agents work their queue but can't
 * route work to other people.
 */
export function canAssignTickets(role?: string | null): boolean {
  return isFullAccess(role) || isSupervisor(role);
}

/**
 * Who may assign live chats to agents — supervisors and above only.
 */
export const canAssignLiveChats = canAssignTickets;
