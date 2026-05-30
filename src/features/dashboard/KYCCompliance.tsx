// src/features/dashboard/KYCCompliance.tsx
//
// Dashboard widget that surfaces the latest KYC queue *live*.
// Data source is the kyc_submissions table via the admin API slice, with a
// Supabase Realtime subscription so the list updates the instant a user
// submits or a teammate approves/rejects.
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Clock, ShieldX, ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { getInitials, safeText } from "@/utils/userDisplay";
import { supabase } from "../../lib/supabase";
import { useGetKycSubmissionsQuery } from "@/api/features/kyc/kycManagementApiSlice";

/** Keep the old prop-driven shape exported for backwards compatibility with
 *  DashboardGrid (it still passes `users` from mock data). The widget itself
 *  prefers the live query over the prop — so live data wins as soon as the
 *  query returns. */
export interface KYCComplianceProps {
  users?: Array<{
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    status: "verified" | "pending" | "blocked" | "flagged";
    role?: string;
    timestamp?: string;
  }>;
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

function statusMeta(s: "pending" | "approved" | "rejected") {
  if (s === "approved")
    return {
      Icon: ShieldCheck,
      label: "Verified",
      badge: "success" as const,
    };
  if (s === "rejected")
    return {
      Icon: ShieldX,
      label: "Rejected",
      badge: "destructive" as const,
    };
  return {
    Icon: Clock,
    label: "Pending",
    badge: "warning" as const,
  };
}

export function KYCCompliance(_props: KYCComplianceProps) {
  const navigate = useNavigate();
  const { data: rows, refetch, isLoading } = useGetKycSubmissionsQuery();

  // Realtime — any change to kyc_submissions refreshes this widget.
  useEffect(() => {
    const ch = supabase
      .channel("dashboard-kyc-widget")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kyc_submissions" },
        () => refetch(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [refetch]);

  // Show pending first (most actionable), then the rest, capped at 6.
  const queue = (rows ?? [])
    .slice()
    .sort((a, b) => {
      const order = { pending: 0, rejected: 1, approved: 2 } as const;
      const oa = order[a.status] ?? 3;
      const ob = order[b.status] ?? 3;
      if (oa !== ob) return oa - ob;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 6);

  const pendingCount = (rows ?? []).filter((r) => r.status === "pending").length;

  return (
    <Card className="p-5">
      <CardHeader className="p-0 pb-4 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base font-semibold">
            KYC &amp; Compliance
          </CardTitle>
          <p className="text-xs text-gray-400 mt-0.5">
            {pendingCount > 0
              ? `${pendingCount} ${pendingCount === 1 ? "submission" : "submissions"} awaiting review`
              : "All caught up"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/kyc")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#013e4a] hover:text-[#013e4a]/80"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-9 w-9 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-32 rounded bg-gray-100" />
                  <div className="h-2.5 w-20 rounded bg-gray-100" />
                </div>
                <div className="h-5 w-16 rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        ) : queue.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <ShieldCheck className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">No submissions yet</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Verification requests will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {queue.map((r) => {
              const name = safeText(r.userName ?? r.userEmail, "Unknown user");
              const initials = getInitials(r.userName ?? r.userEmail, "U");
              const meta = statusMeta(r.status);

              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => navigate("/kyc")}
                  className="flex w-full items-center justify-between py-3 first:pt-0 last:pb-0 text-left hover:bg-gray-50/60 rounded-md px-1 -mx-1 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {timeAgo(r.createdAt)}
                      </p>
                    </div>
                  </div>

                  <Badge variant={meta.badge} className="flex-shrink-0 ml-2">
                    {meta.label}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
