// features/groups/GroupsManager.tsx — CRUD for ticket_groups (Phase 5)
import { useState } from "react";
import {
  useGetTicketGroupsQuery,
  useCreateTicketGroupMutation,
  useUpdateTicketGroupMutation,
  useDeleteTicketGroupMutation,
} from "@/api/features/ticket/ticketApiSlice";
import { Plus, Edit2, Trash2, Check, X, Users as UsersIcon } from "lucide-react";

const DEFAULT_COLORS = ["#1d5c5c", "#C18B3F", "#7c3aed", "#0e7490", "#15803d", "#b91c1c", "#a16207", "#475569"];

export function GroupsManager() {
  const { data: groups = [], isLoading } = useGetTicketGroupsQuery();
  const [createGroup, { isLoading: creating }] = useCreateTicketGroupMutation();
  const [updateGroup] = useUpdateTicketGroupMutation();
  const [deleteGroup] = useDeleteTicketGroupMutation();

  const [adding, setAdding] = useState(false);
  const [newGroup, setNewGroup] = useState({ key: "", name: "", color: DEFAULT_COLORS[0] });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ name: string; color: string }>({ name: "", color: "" });
  const [err, setErr] = useState<string | null>(null);

  const flashErr = (m: string) => {
    setErr(m);
    setTimeout(() => setErr(null), 4000);
  };

  const handleCreate = async () => {
    const key = newGroup.key.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (!key || !newGroup.name.trim()) {
      flashErr("Both key and name are required");
      return;
    }
    try {
      await createGroup({ key, name: newGroup.name.trim(), color: newGroup.color }).unwrap();
      setAdding(false);
      setNewGroup({ key: "", name: "", color: DEFAULT_COLORS[0] });
    } catch (e: any) {
      flashErr(e?.data?.error ?? e?.message ?? "Failed to create group");
    }
  };

  const startEdit = (g: { key: string; name: string; color: string | null }) => {
    setEditingKey(g.key);
    setEditDraft({ name: g.name, color: g.color ?? DEFAULT_COLORS[0] });
  };

  const handleSaveEdit = async () => {
    if (!editingKey) return;
    try {
      await updateGroup({ key: editingKey, name: editDraft.name, color: editDraft.color }).unwrap();
      setEditingKey(null);
    } catch (e: any) {
      flashErr(e?.data?.error ?? "Failed to update group");
    }
  };

  const handleDelete = async (g: { key: string; name: string }) => {
    if (!confirm(`Delete group "${g.name}"? This can't be undone.`)) return;
    try {
      await deleteGroup(g.key).unwrap();
    } catch (e: any) {
      flashErr(e?.data?.error ?? "Failed to delete group");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
            <UsersIcon className="w-4.5 h-4.5 text-teal-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Ticket Groups</h2>
            <p className="text-xs text-gray-500">Departments that own tickets — CSR, Finance, or anything else you add.</p>
          </div>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Group
          </button>
        )}
      </div>

      {err && (
        <div className="px-5 py-2.5 bg-red-50 border-b border-red-200 text-xs text-red-700 font-medium">
          {err}
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500">Loading groups…</div>
        ) : (
          <>
            {/* Add-row */}
            {adding && (
              <div className="px-5 py-4 bg-teal-50/30">
                <div className="grid grid-cols-12 gap-3 items-center">
                  <input
                    type="text"
                    value={newGroup.key}
                    onChange={(e) => setNewGroup(g => ({ ...g, key: e.target.value }))}
                    placeholder="key (e.g. sales)"
                    className="col-span-3 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup(g => ({ ...g, name: e.target.value }))}
                    placeholder="Display name (e.g. Sales Team)"
                    className="col-span-5 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <ColorPicker value={newGroup.color} onChange={(c) => setNewGroup(g => ({ ...g, color: c }))} className="col-span-2" />
                  <div className="col-span-2 flex items-center gap-1 justify-end">
                    <button
                      onClick={handleCreate}
                      disabled={creating}
                      className="p-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setAdding(false); setNewGroup({ key: "", name: "", color: DEFAULT_COLORS[0] }); }}
                      className="p-1.5 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  <strong>Key</strong> is what the system uses internally (lowercase, no spaces). <strong>Name</strong> is what humans see.
                </p>
              </div>
            )}

            {/* Group list */}
            {groups.length === 0 && !adding ? (
              <div className="px-5 py-10 text-center text-sm text-gray-500">
                No groups yet. Click "Add Group" to create the first one.
              </div>
            ) : (
              groups.map((g) => {
                const isEditing = editingKey === g.key;
                const isReserved = g.key === "csr" || g.key === "finance";
                return (
                  <div key={g.key} className="px-5 py-3.5 flex items-center gap-3">
                    {isEditing ? (
                      <>
                        <span className="font-mono text-xs text-gray-500 w-20 truncate">{g.key}</span>
                        <input
                          type="text"
                          value={editDraft.name}
                          onChange={(e) => setEditDraft(d => ({ ...d, name: e.target.value }))}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <ColorPicker value={editDraft.color} onChange={(c) => setEditDraft(d => ({ ...d, color: c }))} />
                        <button onClick={handleSaveEdit} className="p-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingKey(null)} className="p-1.5 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"><X className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <>
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: g.color ?? "#9ca3af" }} />
                        <span className="font-mono text-xs text-gray-500 w-20 truncate">{g.key}</span>
                        <span className="flex-1 text-sm font-semibold text-gray-900">{g.name}</span>
                        {isReserved && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Built-in</span>
                        )}
                        <button
                          onClick={() => startEdit({ ...g, color: g.color ?? null })}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(g)}
                          disabled={isReserved}
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isReserved ? "Built-in groups can't be deleted" : "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange, className = "" }: { value: string; onChange: (c: string) => void; className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {DEFAULT_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-5 h-5 rounded-full border-2 transition-all ${value === c ? "border-gray-900 scale-110" : "border-white hover:border-gray-300"}`}
          style={{ background: c }}
          aria-label={`Pick ${c}`}
        />
      ))}
    </div>
  );
}
