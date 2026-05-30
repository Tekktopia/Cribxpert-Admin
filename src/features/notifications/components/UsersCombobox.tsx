// features/notifications/components/UsersCombobox.tsx
//
// Multi-select combobox for picking specific users to broadcast to.
//   • Typeahead search (name + email)
//   • Selected users shown as removable chips above the search field
//   • Full keyboard nav: ↑/↓ to move, Enter to toggle, Backspace empties last chip
//   • "Select all visible" / "Clear selected" power-user shortcuts
//   • Live result count, loading state, empty state
//
// Built to feel as good as a Linear/Slack people picker.

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Check, X, ChevronDown, Loader2, Users, AlertCircle } from "lucide-react";
import {
  useGetAllUsersQuery,
  type ApiUser,
} from "@/api/features/adminUserManagement/adminUserManagementApiSlice";

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** Hide users matching this predicate from the list (e.g. already-blocked) */
  filter?: (u: ApiUser) => boolean;
  /** Display label shown above the input */
  label?: string;
}

function initials(name: string): string {
  const parts = (name || "").trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UsersCombobox({ selectedIds, onChange, filter, label }: Props) {
  const { data, isLoading, isError, refetch } = useGetAllUsersQuery();
  const users = useMemo<ApiUser[]>(() => {
    const all = data?.users ?? [];
    return filter ? all.filter(filter) : all;
  }, [data, filter]);

  // Quick id → user lookup so chip render is O(1)
  const byId = useMemo(() => {
    const m = new Map<string, ApiUser>();
    users.forEach((u) => m.set(u.userId, u));
    return m;
  }, [users]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Close on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Filter — case-insensitive across name + email
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.role ?? "").toLowerCase().includes(q),
    );
  }, [users, query]);

  // Keep highlight inside bounds when the filtered list shrinks
  useEffect(() => {
    if (highlighted >= visible.length) setHighlighted(0);
  }, [visible.length, highlighted]);

  // Scroll highlighted row into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLLIElement>(
      `[data-idx="${highlighted}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [highlighted, open]);

  const isSelected = (id: string) => selectedIds.includes(id);

  const toggle = (id: string) => {
    onChange(isSelected(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  const removeChip = (id: string) => {
    onChange(selectedIds.filter((x) => x !== id));
  };

  const selectAllVisible = () => {
    const additions = visible.map((u) => u.userId).filter((id) => !isSelected(id));
    if (additions.length === 0) return;
    onChange([...selectedIds, ...additions]);
  };

  const clearAll = () => onChange([]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlighted((i) => Math.min(i + 1, Math.max(visible.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const u = visible[highlighted];
      if (u) toggle(u.userId);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && !query && selectedIds.length > 0) {
      // Remove last chip when the input is empty — Slack-style
      onChange(selectedIds.slice(0, -1));
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}

      {/* Selected chips + search field, presented as a single click target */}
      <div
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
        className={`min-h-[44px] w-full flex flex-wrap items-center gap-1.5 px-2.5 py-1.5 bg-white border rounded-md text-sm transition-colors cursor-text ${
          open
            ? "border-primary-600 ring-2 ring-primary-600/15"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {selectedIds.length === 0 && !open && (
          <span className="inline-flex items-center gap-2 text-gray-400 px-1.5">
            <Users className="w-4 h-4" />
            Pick one or more users…
          </span>
        )}

        {selectedIds.map((id) => {
          const u = byId.get(id);
          return (
            <span
              key={id}
              className="inline-flex items-center gap-1.5 h-7 pl-1 pr-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium"
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-teal-700 text-[10px] font-bold">
                {initials(u?.name ?? "?")}
              </span>
              <span className="max-w-[140px] truncate">{u?.name ?? "Unknown user"}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeChip(id);
                }}
                aria-label={`Remove ${u?.name ?? "user"}`}
                className="w-5 h-5 rounded-full hover:bg-teal-100 flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}

        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setHighlighted(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={selectedIds.length ? "" : ""}
            className="w-full h-7 pl-7 pr-2 bg-transparent text-sm placeholder-gray-400 focus:outline-none"
            autoComplete="off"
          />
        </div>

        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {/* Counter row */}
      <div className="mt-1.5 flex items-center justify-between text-xs text-gray-500">
        <span>
          {selectedIds.length === 0
            ? "No users selected"
            : `${selectedIds.length} user${selectedIds.length === 1 ? "" : "s"} selected`}
        </span>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Action bar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 bg-gray-50/60">
            <span className="text-xs font-medium text-gray-500">
              {isLoading
                ? "Loading…"
                : `${visible.length} match${visible.length === 1 ? "" : "es"}`}
            </span>
            {visible.length > 0 && !isLoading && (
              <button
                type="button"
                onClick={selectAllVisible}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                Select all visible
              </button>
            )}
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Fetching users…
            </div>
          ) : isError ? (
            <div className="px-4 py-6 text-center">
              <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-700">Couldn't load users.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                Try again
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No users match <span className="font-medium text-gray-700">"{query}"</span>.
            </div>
          ) : (
            <ul ref={listRef} className="max-h-72 overflow-y-auto py-1">
              {visible.map((u, i) => {
                const selected = isSelected(u.userId);
                return (
                  <li key={u.userId} data-idx={i}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlighted(i)}
                      onClick={() => toggle(u.userId)}
                      className={`w-full text-left px-3 py-2 flex items-center gap-3 ${
                        i === highlighted ? "bg-teal-50/70" : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {initials(u.name)}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-gray-900 truncate">
                          {u.name || "Unnamed user"}
                        </span>
                        <span className="block text-xs text-gray-500 truncate">
                          {u.email}
                          {u.role && (
                            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600">
                              {u.role}
                            </span>
                          )}
                        </span>
                      </span>
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                          selected
                            ? "bg-teal-600 text-white"
                            : "border-2 border-gray-200 text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
