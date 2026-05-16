// pages/CSR/Settings.tsx — agent email signature + shared canned responses
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { csrNavigationItems } from "@/components/layout/csrSidebar";
import { financeAdminNavigationItems } from "@/components/layout/FinanceSidebar";
import { useAppSelector } from "@/store/hooks";
import { supabase } from "@/lib/supabase";
import { canManageCannedResponses } from "@/utils/roles";
import {
  useGetCannedResponsesQuery,
  useCreateCannedResponseMutation,
  useUpdateCannedResponseMutation,
  useDeleteCannedResponseMutation,
} from "@/api/features/cannedResponses/cannedResponsesApiSlice";
import { useGetTicketGroupsQuery } from "@/api/features/ticket/ticketApiSlice";
import { Mail, MessageSquarePlus, Pencil, Trash2, Check, X, Plus } from "lucide-react";

export default function Settings() {
  const profile = useAppSelector((s) => s.auth.profile);
  const role = (profile?.role ?? "").toLowerCase();
  const userId = profile?.id ?? "";
  const sidebarItems =
    role === "finance_admin" || role === "finance_agent"
      ? financeAdminNavigationItems
      : csrNavigationItems;
  const canManage = canManageCannedResponses(role);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navigationItems={sidebarItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage your email signature and the team's canned replies.
              </p>
            </div>

            <SignatureEditor userId={userId} />

            <CannedResponsesManager canManage={canManage} />
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Email signature (per agent) ─────────────────────────────────────────
function SignatureEditor({ userId }: { userId: string }) {
  const [value, setValue] = useState("");
  const [initial, setInitial] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) return;
      const { data } = await supabase
        .from("profiles")
        .select("email_signature")
        .eq("id", userId)
        .single();
      if (cancelled) return;
      const sig = ((data as { email_signature?: string | null } | null)?.email_signature) ?? "";
      setValue(sig);
      setInitial(sig);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const dirty = value !== initial;

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const { error } = await (supabase.from("profiles") as any)
      .update({ email_signature: value })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      setMsg(`Failed: ${error.message}`);
      return;
    }
    setInitial(value);
    setMsg("Signature saved");
    setTimeout(() => setMsg(null), 2500);
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
          <Mail className="w-4.5 h-4.5 text-teal-700" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Email signature</h2>
          <p className="text-xs text-gray-500">
            Appended to the bottom of your ticket replies. Plain text.
          </p>
        </div>
      </div>
      <div className="p-5 space-y-3">
        {loading ? (
          <div className="text-sm text-gray-500 py-6 text-center">Loading…</div>
        ) : (
          <>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={5}
              placeholder={"e.g.\n—\nJane Doe\nCustomer Support · CribXpert"}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y font-sans"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {msg ?? (dirty ? "Unsaved changes" : "Up to date")}
              </span>
              <button
                onClick={save}
                disabled={!dirty || saving}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save signature"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ── Canned responses (shared) ───────────────────────────────────────────
function CannedResponsesManager({ canManage }: { canManage: boolean }) {
  const { data: canned = [], isLoading } = useGetCannedResponsesQuery();
  const { data: groups = [] } = useGetTicketGroupsQuery();
  const [createCanned, { isLoading: creating }] = useCreateCannedResponseMutation();
  const [updateCanned] = useUpdateCannedResponseMutation();
  const [deleteCanned] = useDeleteCannedResponseMutation();

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "", groupKey: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ title: "", body: "", groupKey: "" });
  const [err, setErr] = useState<string | null>(null);

  const groupName = useMemo(() => {
    const m = new Map(groups.map((g) => [g.key, g.name]));
    return (key: string | null) => (key ? m.get(key) ?? key : "All groups");
  }, [groups]);

  const flash = (m: string) => {
    setErr(m);
    setTimeout(() => setErr(null), 4000);
  };

  const handleCreate = async () => {
    if (!draft.title.trim() || !draft.body.trim()) {
      flash("Title and body are required");
      return;
    }
    try {
      await createCanned({
        title: draft.title,
        body: draft.body,
        groupKey: draft.groupKey || null,
      }).unwrap();
      setAdding(false);
      setDraft({ title: "", body: "", groupKey: "" });
    } catch (e: any) {
      flash(e?.data?.error ?? e?.message ?? "Failed to create");
    }
  };

  const startEdit = (c: { id: string; title: string; body: string; groupKey: string | null }) => {
    setEditingId(c.id);
    setEditDraft({ title: c.title, body: c.body, groupKey: c.groupKey ?? "" });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await updateCanned({
        id: editingId,
        title: editDraft.title,
        body: editDraft.body,
        groupKey: editDraft.groupKey || null,
      }).unwrap();
      setEditingId(null);
    } catch (e: any) {
      flash(e?.data?.error ?? "Failed to update");
    }
  };

  const handleDelete = async (c: { id: string; title: string }) => {
    if (!confirm(`Delete canned reply "${c.title}"?`)) return;
    try {
      await deleteCanned(c.id).unwrap();
    } catch (e: any) {
      flash(e?.data?.error ?? "Failed to delete");
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
            <MessageSquarePlus className="w-4.5 h-4.5 text-teal-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Canned responses</h2>
            <p className="text-xs text-gray-500">
              Reusable replies agents can drop into a ticket in one click.
            </p>
          </div>
        </div>
        {canManage && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New reply
          </button>
        )}
      </div>

      {err && (
        <div className="px-5 py-2.5 bg-red-50 border-b border-red-200 text-xs text-red-700 font-medium">
          {err}
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {canManage && adding && (
          <div className="p-5 bg-teal-50/30 space-y-3">
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Title (e.g. Refund acknowledgement)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <textarea
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              rows={4}
              placeholder="Reply body…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
            />
            <div className="flex items-center gap-3">
              <select
                value={draft.groupKey}
                onChange={(e) => setDraft((d) => ({ ...d, groupKey: e.target.value }))}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All groups</option>
                {groups.map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.name}
                  </option>
                ))}
              </select>
              <div className="flex-1" />
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-3 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setDraft({ title: "", body: "", groupKey: "" });
                }}
                className="px-3 py-2 text-sm font-semibold rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500">Loading…</div>
        ) : canned.length === 0 && !adding ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500">
            No canned responses yet.
            {canManage ? ' Click "New reply" to create one.' : " A supervisor can add some."}
          </div>
        ) : (
          canned.map((c) =>
            editingId === c.id ? (
              <div key={c.id} className="p-5 bg-teal-50/30 space-y-3">
                <input
                  value={editDraft.title}
                  onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <textarea
                  value={editDraft.body}
                  onChange={(e) => setEditDraft((d) => ({ ...d, body: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
                />
                <div className="flex items-center gap-3">
                  <select
                    value={editDraft.groupKey}
                    onChange={(e) => setEditDraft((d) => ({ ...d, groupKey: e.target.value }))}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">All groups</option>
                    {groups.map((g) => (
                      <option key={g.key} value={g.key}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex-1" />
                  <button
                    onClick={saveEdit}
                    className="px-3 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-2 text-sm font-semibold rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={c.id} className="px-5 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{c.title}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {groupName(c.groupKey)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap line-clamp-3">
                    {c.body}
                  </p>
                </div>
                {canManage && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(c)}
                      className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ),
          )
        )}
      </div>
    </section>
  );
}
