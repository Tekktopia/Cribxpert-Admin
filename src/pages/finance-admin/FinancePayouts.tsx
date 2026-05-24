// src/pages/finance-admin/FinancePayouts.tsx
// Live escrow payout console — lists bookings with FUNDS_HELD / DELIVERY_CONFIRMED
// status and lets admins release funds to hosts via the SZND edge function.
import { useState, useMemo, useEffect } from "react";
import {
  ChevronDown, MoreVertical, Search, CheckSquare, Square,
  Eye, Send, RefreshCcw, Loader2, AlertTriangle,
} from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PayoutDetailsModal, type PayoutTransaction } from "@/features/finance-admin/PayoutDetailsModal";
import { NotificationToast, type NotificationProps } from "@/components/ui/NotificationToast";
import {
  useGetPendingPayoutsQuery,
  useDisburseToHostMutation,
  type PendingPayout,
} from "@/api/features/escrowPayouts";

// Platform fee preview — must match PLATFORM_FEE_PERCENT in the edge function.
const PREVIEW_FEE_PERCENT = 10;

// Map a live PendingPayout to the shape PayoutDetailsModal already expects.
function toPayoutTransaction(p: PendingPayout): PayoutTransaction {
  const hostAmt = Math.round(p.totalPrice * (1 - PREVIEW_FEE_PERCENT / 100));
  return {
    id:              p.bookingId,
    transactionId:   p.bookingId.slice(0, 8).toUpperCase(),
    relatedBookingId: p.bookingId.slice(0, 8).toUpperCase(),
    amount:          hostAmt,
    date:            p.paidAt ?? p.checkOut ?? '',
    scheduledDate:   p.checkOut ?? '',
    status:          p.escrowStatus === 'DELIVERY_CONFIRMED' ? 'completed' : 'pending',
    payoutStatus:    p.escrowStatus === 'DELIVERY_CONFIRMED' ? 'Approved' : 'Pending',
    type:            'payout',
    user: {
      name:   p.hostName,
      email:  '',
      avatar: '',
    },
  };
}

type FilterStatus = 'All Status' | 'Approved' | 'Pending';
type Period       = 'This Month' | 'Last Month' | 'This Year' | 'All Time';

export default function FinancePayouts() {
  // ── Live data ────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching, refetch, error } = useGetPendingPayoutsQuery();
  const [disburse] = useDisburseToHostMutation();

  // ── UI state ────────────────────────────────────────────────────────────────
  const [selectedIds,    setSelectedIds]    = useState<Set<string>>(new Set());
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutTransaction | null>(null);
  const [notification,   setNotification]   = useState<NotificationProps | null>(null);
  const [busyId,         setBusyId]         = useState<string | null>(null);

  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [currentPeriod,   setCurrentPeriod]   = useState<Period>('This Month');

  const [filters, setFilters] = useState<{ status: FilterStatus; hostSearch: string }>({
    status:     'All Status',
    hostSearch: '',
  });

  // Close dropdowns on outside click.
  useEffect(() => {
    const close = () => { setActiveActionId(null); setIsMonthMenuOpen(false); };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const payoutsData = useMemo<PendingPayout[]>(() => {
    let all = data?.payouts ?? [];

    // Period filter (approximate — refine once a date-range API param exists).
    const now   = new Date();
    const start = new Date(now);
    if (currentPeriod === 'This Month')  start.setDate(1);
    if (currentPeriod === 'Last Month')  { start.setMonth(start.getMonth() - 1); start.setDate(1); }
    if (currentPeriod === 'This Year')   start.setMonth(0, 1);
    if (currentPeriod !== 'All Time') {
      all = all.filter((p) => {
        const d = p.paidAt ?? p.checkOut;
        return d ? new Date(d) >= start : true;
      });
    }

    // Status filter
    if (filters.status !== 'All Status') {
      all = all.filter((p) =>
        filters.status === 'Approved'
          ? p.escrowStatus === 'DELIVERY_CONFIRMED'
          : p.escrowStatus === 'FUNDS_HELD'
      );
    }

    // Host search
    if (filters.hostSearch.trim()) {
      const s = filters.hostSearch.toLowerCase();
      all = all.filter((p) =>
        p.hostName.toLowerCase().includes(s) ||
        p.listingName.toLowerCase().includes(s) ||
        p.guestName.toLowerCase().includes(s)
      );
    }

    return all;
  }, [data?.payouts, filters, currentPeriod]);

  const totals = useMemo(() => {
    const all  = data?.payouts ?? [];
    const sum  = all.reduce((s, p) => s + p.totalPrice, 0);
    const fees = Math.round(sum * (PREVIEW_FEE_PERCENT / 100));
    return { count: all.length, gross: sum, fees, hosts: sum - fees };
  }, [data?.payouts]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleRelease = async (p: PendingPayout) => {
    if (!p.hostTag) {
      setNotification({
        id: Date.now().toString(), type: 'error',
        title: 'Cannot disburse',
        message: `${p.hostName} has not set their SZND payout tag.`,
      });
      return;
    }
    setBusyId(p.bookingId);
    try {
      const result = await disburse({ bookingId: p.bookingId }).unwrap();
      setNotification({
        id: Date.now().toString(), type: 'success',
        title: 'Payout released',
        message: `₦${Number(result.hostAmount).toLocaleString()} sent to ${p.hostName}. Fee: ₦${Number(result.platformFee).toLocaleString()}.`,
      });
    } catch (e: any) {
      setNotification({
        id: Date.now().toString(), type: 'error',
        title: 'Payout failed',
        message: e?.error ?? e?.message ?? 'Could not release payout.',
      });
    } finally {
      setBusyId(null);
      setActiveActionId(null);
    }
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.size === payoutsData.length
        ? new Set()
        : new Set(payoutsData.map((p) => p.bookingId))
    );
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <PageWrapper
      title="Payouts"
      subtitle="Review and release escrow funds to hosts after commission deduction"
      isPopulated={true}
      headerComponent={
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Review and release escrow funds to hosts after commission deduction
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-teal-700 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              <RefreshCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing…' : 'Refresh'}
            </button>

            {/* Period dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setIsMonthMenuOpen(!isMonthMenuOpen); }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
              >
                {currentPeriod}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isMonthMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMonthMenuOpen && (
                <div className="absolute right-0 top-11 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                  {(['This Month', 'Last Month', 'This Year', 'All Time'] as Period[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setCurrentPeriod(p); setIsMonthMenuOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 hover:text-teal-700 transition-colors ${currentPeriod === p ? 'text-teal-700 font-semibold' : 'text-gray-700'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      }
    >
      {/* Toast */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {notification && (
          <NotificationToast
            key={notification.id}
            id={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            isVisible={!!notification}
            onRemove={() => setNotification(null)}
          />
        )}
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <SummaryTile label="Awaiting"    value={String(totals.count)} />
        <SummaryTile label="Gross held"  value={`₦${totals.gross.toLocaleString()}`} />
        <SummaryTile label="Host payout" value={`₦${totals.hosts.toLocaleString()}`} highlight />
        <SummaryTile label={`Platform (${PREVIEW_FEE_PERCENT}%)`} value={`₦${totals.fees.toLocaleString()}`} />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 items-end">
        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-900">Status</label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as FilterStatus })}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {(['All Status', 'Approved', 'Pending'] as FilterStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="md:col-span-9 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-900">Host / Listing / Guest</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search…"
              value={filters.hostSearch}
              onChange={(e) => setFilters({ ...filters, hostSearch: e.target.value })}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-teal-500 placeholder:text-gray-400"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700">Couldn't load pending payouts</p>
            <p className="text-xs text-red-600 mt-0.5">{(error as any)?.error ?? 'Unknown error'}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="text-sm text-red-700 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-visible shadow-sm min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-12">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                    {selectedIds.size === payoutsData.length && payoutsData.length > 0
                      ? <CheckSquare className="w-5 h-5 text-teal-600" />
                      : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <Th>Booking ID</Th>
                <Th>Listing</Th>
                <Th>Host</Th>
                <Th>Guest</Th>
                <Th>Host gets</Th>
                <Th>Status</Th>
                <Th>Check-out</Th>
                <Th align="center">Action</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {payoutsData.map((p) => {
                const hostAmt  = Math.round(p.totalPrice * (1 - PREVIEW_FEE_PERCENT / 100));
                const isSelected = selectedIds.has(p.bookingId);
                const busy     = busyId === p.bookingId;
                return (
                  <tr key={p.bookingId} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-teal-50/30' : 'bg-white'}`}>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleSelectRow(p.bookingId)} className="text-gray-400 hover:text-gray-600">
                        {isSelected
                          ? <CheckSquare className="w-5 h-5 text-teal-600" />
                          : <Square className="w-5 h-5" />}
                      </button>
                    </td>

                    <Td className="font-mono text-xs text-gray-500">{p.bookingId.slice(0, 8)}…</Td>
                    <Td className="font-medium text-gray-900 max-w-[160px] truncate">{p.listingName}</Td>
                    <Td>
                      <div className="text-sm text-gray-700">{p.hostName}</div>
                      {p.hostTag
                        ? <div className="text-xs font-mono text-gray-400">@{p.hostTag}</div>
                        : <div className="text-xs font-semibold text-red-500">no SZND tag</div>
                      }
                    </Td>
                    <Td>{p.guestName}</Td>
                    <Td className="font-semibold text-teal-700">
                      ₦{hostAmt.toLocaleString()}
                      <div className="text-xs text-gray-400 font-normal">of ₦{p.totalPrice.toLocaleString()}</div>
                    </Td>
                    <Td><EscrowStatusBadge status={p.escrowStatus} /></Td>
                    <Td>{p.checkOut ? new Date(p.checkOut).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : '—'}</Td>

                    <td className="px-6 py-4 text-center relative bg-white">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveActionId(activeActionId === p.bookingId ? null : p.bookingId); }}
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 inline-flex items-center justify-center transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeActionId === p.bookingId && (
                        <div className="absolute right-8 top-10 w-52 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden text-left">
                          <button
                            onClick={() => { setSelectedPayout(toPayoutTransaction(p)); setActiveActionId(null); }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye size={16} className="text-gray-400" />
                            View details
                          </button>
                          <button
                            disabled={busy || !p.hostTag}
                            onClick={() => handleRelease(p)}
                            className="w-full px-4 py-3 text-left text-sm text-teal-700 hover:bg-teal-50 flex items-center gap-2 border-t border-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {busy
                              ? <Loader2 size={16} className="animate-spin text-teal-500" />
                              : <Send size={16} className="text-teal-500" />
                            }
                            {busy ? 'Releasing…' : p.hostTag ? 'Release payout' : 'No SZND tag'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!isLoading && payoutsData.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              {data?.payouts?.length === 0
                ? 'No pending payouts right now — all caught up!'
                : 'No payouts match your current filters.'}
            </div>
          )}
        </div>
      )}

      {selectedPayout && (
        <PayoutDetailsModal
          item={selectedPayout}
          onClose={() => setSelectedPayout(null)}
          onApprove={() => setSelectedPayout(null)}
          onReject={() => setSelectedPayout(null)}
          onMarkPaid={() => setSelectedPayout(null)}
        />
      )}
    </PageWrapper>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function SummaryTile({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-200'}`}>
      <p className={`text-lg font-bold tabular-nums ${highlight ? 'text-teal-700' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function EscrowStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DELIVERY_CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    FUNDS_HELD:         'bg-blue-50 text-blue-700 border-blue-200',
  };
  const label = status === 'DELIVERY_CONFIRMED' ? 'Stay confirmed'
              : status === 'FUNDS_HELD'          ? 'Funds held'
              : status;
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold border ${map[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {label}
    </span>
  );
}

interface ThProps { children: React.ReactNode; align?: 'left' | 'center' | 'right'; className?: string; }
const Th = ({ children, align = 'left', className = '' }: ThProps) => (
  <th className={`px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wide whitespace-nowrap text-${align} ${className}`}>
    {children}
  </th>
);

interface TdProps { children: React.ReactNode; className?: string; }
const Td = ({ children, className = '' }: TdProps) => (
  <td className={`px-6 py-4 text-sm text-gray-600 whitespace-nowrap bg-white ${className}`}>
    {children}
  </td>
);
