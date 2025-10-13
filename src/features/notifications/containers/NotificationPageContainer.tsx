import { useState } from "react";
import { CreateNotificationCard } from "../components/CreateNotificationCard";
import type { NotificationFormValue } from "../components/NotificationForm";
import { NotificationHistoryTable } from "../components/NotificationHistoryTable";
import { mockNotifications } from "../utils/mocks";
import { type NotificationRecord } from "../utils/types";
import { ScheduleDateModal } from "../modals/ScheduleDateModal";
import { useActionNotifications } from "@/utils/notificationHelpers";

export function NotificationPageContainer() {
  const { showSuccess, showError } = useActionNotifications();

  const [form, setForm] = useState<NotificationFormValue>({
    title: "",
    audience: "all",
    message: "",
    isScheduled: false,
  });
  const [data, setData] = useState<NotificationRecord[]>(mockNotifications);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const onChange = (patch: Partial<NotificationFormValue>) =>
    setForm((p) => ({ ...p, ...patch }));

  const handleSendNow = () => {
    if (!form.title.trim() || !form.message.trim()) {
      showError("Missing fields", "Please enter title and message.");
      return;
    }
    const newRow: NotificationRecord = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      audience: form.audience,
      message: form.message.trim(),
      status: "sent",
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setData((d) => [newRow, ...d]);
    showSuccess("Notification Sent", "Your notification was sent.");
    setForm({
      title: "",
      audience: form.audience,
      message: "",
      isScheduled: false,
    });
  };

  const handlePickDate = () => setIsScheduleOpen(true);

  const handleConfirmSchedule = (isoLocal: string) => {
    setIsScheduleOpen(false);
    // store local datetime as ISO
    const iso = new Date(isoLocal).toISOString();
    setForm((p) => ({ ...p, scheduledAt: iso }));
  };

  const handleSchedule = () => {
    if (!form.title.trim() || !form.message.trim() || !form.scheduledAt) {
      showError(
        "Incomplete schedule",
        "Provide title, message and schedule date."
      );
      return;
    }
    const newRow: NotificationRecord = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      audience: form.audience,
      message: form.message.trim(),
      status: "scheduled",
      scheduledAt: form.scheduledAt,
      createdAt: new Date().toISOString(),
    };
    setData((d) => [newRow, ...d]);
    showSuccess("Notification Scheduled", "It will be sent automatically.");
    setForm({
      title: "",
      audience: form.audience,
      message: "",
      isScheduled: true,
      scheduledAt: undefined,
    });
  };

  const handleRowAction = (item: NotificationRecord, action: string) => {
    if (action === "delete") {
      setData((d) => d.filter((x) => x.id !== item.id));
      return;
    }
    if (action === "cancel") {
      setData((d) =>
        d.map((x) =>
          x.id === item.id
            ? { ...x, status: "draft", scheduledAt: undefined }
            : x
        )
      );
      return;
    }
    // view/edit can be wired later
  };

  return (
    <div className='space-y-8'>
      <CreateNotificationCard
        value={form}
        onChange={onChange}
        onSendNow={handleSendNow}
        onPickDate={handlePickDate}
        onSchedule={handleSchedule}
      />

      <div>
        <h3 className='text-base font-semibold text-gray-900 mb-3'>
          Notification History
        </h3>
        <NotificationHistoryTable data={data} onAction={handleRowAction} />
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
