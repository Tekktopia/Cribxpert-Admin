import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  Users,
  Mail,
  MoreVertical,
  TrendingUp,
  Wallet,
  CalendarCheck,
  Hourglass,
  Ban,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { Booking } from "@/api/features/bookings/bookingsManagementApiSlice";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/utils/statusBadges";

interface BookingMgmtGridProps {
  bookings: Booking[];
  onStatusUpdate: (bookingId: string, status: string) => void;
}

const naira = (n: number) => `₦${n.toLocaleString()}`;
const fmtDate = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const nights = (a: string, b: string) => {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
};

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "G";

function statusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "completed":
      return <CheckCircle className="w-3.5 h-3.5" />;
    case "cancelled":
      return <XCircle className="w-3.5 h-3.5" />;
    default:
      return <Clock className="w-3.5 h-3.5" />;
  }
}

export function BookingMgmtGrid({ bookings, onStatusUpdate }: BookingMgmtGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        b.guestName.toLowerCase().includes(q) ||
        b.propertyName.toLowerCase().includes(q) ||
        b.ticketId.toLowerCase().includes(q) ||
        b.guestEmail.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || b.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  // ── KPI roll-ups ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const s = { total: bookings.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0, revenue: 0 };
    for (const b of bookings) {
      const st = b.status.toLowerCase();
      if (st === "pending") s.pending++;
      else if (st === "confirmed") s.confirmed++;
      else if (st === "completed") s.completed++;
      else if (st === "cancelled") s.cancelled++;
      if (st === "confirmed" || st === "completed") s.revenue += b.totalPrice;
    }
    return s;
  }, [bookings]);

  // ── 6-month booking trend (count + revenue) for the area chart ────────
  const trend = useMemo(() => {
    const months: { key: string; label: string; bookings: number; revenue: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("en-GB", { month: "short" }),
        bookings: 0,
        revenue: 0,
      });
    }
    const idx = new Map(months.map((m, i) => [m.key, i]));
    for (const b of bookings) {
      if (!b.createdAt) continue;
      const d = new Date(b.createdAt);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      const i = idx.get(k);
      if (i === undefined) continue;
      months[i].bookings++;
      const st = b.status.toLowerCase();
      if (st === "confirmed" || st === "completed") months[i].revenue += b.totalPrice;
    }
    return months;
  }, [bookings]);

  return (
    <div className="space-y-6">
      {/* ── KPI strip ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard icon={<CalendarDays className="w-5 h-5" />} tint="teal" label="Total Bookings" value={stats.total} />
        <KpiCard icon={<Hourglass className="w-5 h-5" />} tint="amber" label="Pending" value={stats.pending} />
        <KpiCard icon={<CalendarCheck className="w-5 h-5" />} tint="blue" label="Confirmed" value={stats.confirmed} />
        <KpiCard icon={<Ban className="w-5 h-5" />} tint="red" label="Cancelled" value={stats.cancelled} />
        <KpiCard icon={<Wallet className="w-5 h-5" />} tint="green" label="Revenue" value={naira(stats.revenue)} />
      </div>

      {/* ── Trend chart ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary-600" />
              Bookings &amp; Revenue — last 6 months
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Confirmed &amp; completed revenue</p>
          </div>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="bkBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006073" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#006073" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bkRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C18B3F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C18B3F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                formatter={(value, name) =>
                  name === "revenue"
                    ? [naira(Number(value)), "Revenue"]
                    : [String(value), "Bookings"]
                }
              />
              <Area type="monotone" dataKey="bookings" stroke="#006073" strokeWidth={2} fill="url(#bkBookings)" />
              <Area type="monotone" dataKey="revenue" stroke="#C18B3F" strokeWidth={2} fill="url(#bkRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by guest, listing, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* ── Booking cards ───────────────────────────────────────────── */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No bookings match your filters</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search or status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onStatusUpdate={onStatusUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Booking card ──────────────────────────────────────────────────────
function BookingCard({
  booking,
  onStatusUpdate,
}: {
  booking: Booking;
  onStatusUpdate: (id: string, status: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const n = nights(booking.startDate, booking.endDate);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all overflow-hidden flex flex-col">
      {/* Header band */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials(booking.guestName)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{booking.guestName}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              {booking.guestEmail || "—"}
            </p>
          </div>
        </div>
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Booking actions"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-10 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
              <button onClick={() => { onStatusUpdate(booking.id, "Confirmed"); setMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Mark Confirmed</button>
              <button onClick={() => { onStatusUpdate(booking.id, "Completed"); setMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Mark Completed</button>
              <button onClick={() => { onStatusUpdate(booking.id, "Cancelled"); setMenuOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">Cancel Booking</button>
            </div>
          )}
        </div>
      </div>

      {/* Listing + host */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-700">
          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate font-medium">{booking.propertyName}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate">
          <Users className="w-3 h-3 flex-shrink-0" />
          Host: {booking.hostName}
        </p>
      </div>

      {/* Dates strip */}
      <div className="mx-4 mb-3 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5 flex items-center justify-between text-xs">
        <div>
          <p className="text-gray-400">Check-in</p>
          <p className="font-semibold text-gray-800">{fmtDate(booking.startDate)}</p>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <CalendarDays className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">{n} night{n === 1 ? "" : "s"}</span>
        </div>
        <div className="text-right">
          <p className="text-gray-400">Check-out</p>
          <p className="font-semibold text-gray-800">{fmtDate(booking.endDate)}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-gray-900">{naira(booking.totalPrice)}</p>
          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            <Wallet className="w-3 h-3" />
            {naira(booking.commission)} fee
            <span className="text-gray-300">·</span>
            #{booking.ticketId}
          </p>
        </div>
        <Badge variant={getStatusVariant(booking.status.toLowerCase(), "booking")}>
          <span className="flex items-center gap-1 capitalize">
            {statusIcon(booking.status)}
            {booking.status}
          </span>
        </Badge>
      </div>
    </div>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────
function KpiCard({
  icon,
  tint,
  label,
  value,
}: {
  icon: React.ReactNode;
  tint: "teal" | "amber" | "blue" | "red" | "green";
  label: string;
  value: number | string;
}) {
  const tints: Record<string, string> = {
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    green: "bg-green-50 text-green-700",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${tints[tint]}`}>{icon}</div>
      <div className="text-xl font-bold text-gray-900 truncate">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
