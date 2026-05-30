import { useEffect, useState } from "react";
import { CreateNotificationCard } from "../components/CreateNotificationCard";
import type { NotificationFormValue } from "../components/NotificationForm";
import { NotificationHistoryTable } from "../components/NotificationHistoryTable";
import { type NotificationRecord } from "../utils/types";
import { ScheduleDateModal } from "../modals/ScheduleDateModal";
import { useActionNotifications } from "@/utils/notificationHelpers";
import { supabase } from "@/lib/supabase";
import { AdminInboxView } from "./AdminInboxView";
import { Inbox, Send } from "lucide-react";

export function NotificationPageContainer() {
  const [view, setView] = useState<"inbox" | "broadcast">("inbox");

  return (
    <div className="space-y-6">
      {/* Top-level tab switcher: Inbox vs Broadcast */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setView("inbox")}
          className={`inline-flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-semibold transition-all ${
            view === "inbox"
              ? "bg-white text-[#1d5c5c] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Inbox className="w-4 h-4" />
          Inbox
        </button>
        <button
          onClick={() => setView("broadcast")}
          className={`inline-flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-semibold transition-all ${
            view === "broadcast"
              ? "bg-white text-[#1d5c5c] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Send className="w-4 h-4" />
          Broadcast
        </button>
      </div>

      {view === "inbox" ? <AdminInboxView /> : <BroadcastView />}
    </div>
  );
}

function BroadcastView() {
  const { showSuccess, showError } = useActionNotifications();

  const [form, setForm] = useState<NotificationFormValue>({
    title: "",
    audience: "all",
    message: "",
    isScheduled: false,
  });
  const [data, setData] = useState<NotificationRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Load broadcast notification history from Supabase
  useEffect(() => {
    const load = async () => {
      setIsLoadingHistory(true);
      const { data: rows, error } = await supabase
        .from("broadcast_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100) as { data: any[] | null; error: any };

      if (error) {
        console.error("Failed to load notification history:", error.message);
      } else {
        setData(
          (rows ?? []).map((r: any) => ({
            id: r.id,
            title: r.title,
            audience: r.audience ?? "all",
            message: r.message,
            status: r.status ?? "sent",
            scheduledAt: r.scheduled_at ?? undefined,
            sentAt: r.sent_at ?? undefined,
            createdAt: r.created_at,
          }))
        );
      }
      setIsLoadingHistory(false);
    };
    load();
  }, []);

  const onChange = (patch: Partial<NotificationFormValue>) =>
    setForm((p) => ({ ...p, ...patch }));

  const broadcastToUsers = async (
    title: string,
    message: string,
    audience: string,
    status: "sent" | "scheduled",
    scheduledAt?: string,
    targetUserIds?: string[],
  ): Promise<boolean> => {
    // 1. Record the broadcast in broadcast_notifications table
    const { data: broadcast, error: broadcastErr } = await (supabase
      .from("broadcast_notifications")
      .insert({
        title,
        message,
        audience,
        status,
        scheduled_at: scheduledAt ?? null,
        sent_at: status === "sent" ? new Date().toISOString() : null,
      } as any)
      .select("*")
      .single() as any);

    if (broadcastErr) {
      showError("Failed", broadcastErr.message);
      return false;
    }

    // 2. If sending now, insert into each target user's notifications
    if (status === "sent") {
      let targetIds: string[] = [];

      if (audience === "custom") {
        // Targeted broadcast — exact list of user IDs from the combobox
        targetIds = (targetUserIds ?? []).filter(Boolean);
      } else {
        let query = supabase.from("profiles").select("id");
        if (audience === "hosts") {
          query = query.eq("is_host", true);
        } else if (audience === "guests") {
          query = query.eq("is_host", false).eq("role", "user");
        } else if (audience === "all") {
          // "all" sends to every regular user (and hosts, who also have role='user')
          query = query.in("role", ["user"]);
        }
        const { data: users } = await (query as any);
        targetIds = (users ?? []).map((u: { id: string }) => u.id);
      }

      if (targetIds.length > 0) {
        await (supabase.from("notifications") as any).insert(
          targetIds.map((uid) => ({
            user_id: uid,
            title,
            description: message,
            category: "general",
            is_read: false,
          })),
        );
      }
    }

    // Add to local state
    const bc = broadcast as any;
    setData((d) => [
      {
        id: bc.id,
        title: bc.title,
        audience: bc.audience ?? "all",
        message: bc.message,
        status: bc.status,
        scheduledAt: bc.scheduled_at ?? undefined,
        sentAt: bc.sent_at ?? undefined,
        createdAt: bc.created_at,
      },
      ...d,
    ]);

    return true;
  };

  const handleSendNow = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      showError("Missing fields", "Please enter title and message.");
      return;
    }
    if (form.audience === "custom" && (form.targetUserIds ?? []).length === 0) {
      showError("Pick recipients", "Select at least one user from the list, or change the audience.");
      return;
    }
    setIsSending(true);
    const ok = await broadcastToUsers(
      form.title.trim(),
      form.message.trim(),
      form.audience,
      "sent",
      undefined,
      form.targetUserIds,
    );
    setIsSending(false);
    if (ok) {
      const recipientCount =
        form.audience === "custom" ? (form.targetUserIds ?? []).length : null;
      showSuccess(
        "Notification Sent",
        form.audience === "custom"
          ? `Delivered to ${recipientCount} selected user${recipientCount === 1 ? "" : "s"}.`
          : `Sent to all ${form.audience} users.`,
      );
      setForm({ title: "", audience: form.audience, message: "", isScheduled: false, targetUserIds: [] });
    }
  };

  const handlePickDate = () => setIsScheduleOpen(true);

  const handleConfirmSchedule = (isoLocal: string) => {
    setIsScheduleOpen(false);
    const iso = new Date(isoLocal).toISOString();
    setForm((p) => ({ ...p, scheduledAt: iso }));
  };

  const handleSchedule = async () => {
    if (!form.title.trim() || !form.message.trim() || !form.scheduledAt) {
      showError("Incomplete schedule", "Provide title, message and schedule date.");
      return;
    }
    if (form.audience === "custom" && (form.targetUserIds ?? []).length === 0) {
      showError("Pick recipients", "Select at least one user from the list, or change the audience.");
      return;
    }
    setIsSending(true);
    const ok = await broadcastToUsers(
      form.title.trim(),
      form.message.trim(),
      form.audience,
      "scheduled",
      form.scheduledAt,
      form.targetUserIds,
    );
    setIsSending(false);
    if (ok) {
      showSuccess("Notification Scheduled", "It will be sent automatically.");
      setForm({ title: "", audience: form.audience, message: "", isScheduled: true, scheduledAt: undefined, targetUserIds: [] });
    }
  };

  const handleRowAction = async (item: NotificationRecord, action: string) => {
    if (action === "delete") {
      const { error } = await supabase
        .from("broadcast_notifications")
        .delete()
        .eq("id", item.id);
      if (!error) setData((d) => d.filter((x) => x.id !== item.id));
      return;
    }
    if (action === "cancel") {
      const { error } = await ((supabase.from("broadcast_notifications") as any)
        .update({ status: "draft", scheduled_at: null })
        .eq("id", item.id));
      if (!error) {
        setData((d) =>
          d.map((x) =>
            x.id === item.id ? { ...x, status: "draft", scheduledAt: undefined } : x
          )
        );
      }
      return;
    }
  };

  return (
    <div className="space-y-8">
      <CreateNotificationCard
        value={form}
        onChange={onChange}
        onSendNow={handleSendNow}
        onPickDate={handlePickDate}
        onSchedule={handleSchedule}
        isSending={isSending}
      />

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Notification History
        </h3>
        {isLoadingHistory ? (
          <p className="text-sm text-gray-400">Loading history...</p>
        ) : (
          <NotificationHistoryTable data={data} onAction={handleRowAction} />
        )}
      </div>

      <ScheduleDateModal
        isOpen={isScheduleOpen}
        defaultValue={form.scheduledAt}
        onCancel={() => setIsScheduleOpen(false)}
        onConfirm={handleConfirmSchedule}
      />
    </div>
  );
}
