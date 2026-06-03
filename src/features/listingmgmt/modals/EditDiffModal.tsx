// EditDiffModal.tsx — shows before/after diff when admin reviews an edited listing
import { X, ArrowRight, AlertTriangle } from "lucide-react";
import type { ApiListing } from "@/api/features/adminListingManagement/adminListingManagementApiSlice";

interface EditDiffModalProps {
  listing: ApiListing;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

const naira = (v: unknown) =>
  v != null && v !== "" ? `₦${Number(v).toLocaleString()}` : "—";

const fmt = (v: unknown): string => {
  if (v == null || v === "") return "—";
  if (typeof v === "string" && v.includes("T")) {
    const d = new Date(v);
    if (!isNaN(d.getTime()))
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  return String(v);
};

const PRICE_FIELDS = new Set(["base_price", "cleaning_fee", "security_deposit"]);

function DiffRow({ label, before, after, isPriceField = false }: {
  label: string;
  before: unknown;
  after: unknown;
  isPriceField?: boolean;
}) {
  const b = isPriceField ? naira(before) : fmt(before);
  const a = isPriceField ? naira(after) : fmt(after);
  const changed = b !== a;

  return (
    <tr className={changed ? "bg-amber-50" : ""}>
      <td className="px-4 py-2.5 text-sm font-medium text-gray-600 whitespace-nowrap">{label}</td>
      <td className={`px-4 py-2.5 text-sm ${changed ? "text-red-700 line-through" : "text-gray-700"}`}>
        {b}
      </td>
      <td className="px-3 py-2.5 text-gray-400">
        {changed && <ArrowRight className="w-3.5 h-3.5" />}
      </td>
      <td className={`px-4 py-2.5 text-sm font-semibold ${changed ? "text-green-700" : "text-gray-700"}`}>
        {a}
      </td>
    </tr>
  );
}

const FIELD_LABELS: { key: string; label: string }[] = [
  { key: "name",             label: "Title" },
  { key: "description",      label: "Description" },
  { key: "base_price",       label: "Nightly rate" },
  { key: "cleaning_fee",     label: "Cleaning fee" },
  { key: "security_deposit", label: "Security deposit" },
  { key: "guest_no",         label: "Max guests" },
  { key: "bedroom_no",       label: "Bedrooms" },
  { key: "bathroom_no",      label: "Bathrooms" },
  { key: "size",             label: "Size (m²)" },
  { key: "street",           label: "Street" },
  { key: "city",             label: "City / LGA" },
  { key: "state",            label: "State" },
  { key: "available_from",   label: "Available from" },
  { key: "available_until",  label: "Available until" },
  { key: "additional_rules", label: "House rules" },
];

export function EditDiffModal({ listing, onClose, onApprove, onReject, isApproving, isRejecting }: EditDiffModalProps) {
  const snap = listing.editSnapshot ?? {};

  // Map current listing fields to same key names as snapshot
  const current: Record<string, unknown> = {
    name:             listing.name,
    description:      listing.description,
    base_price:       listing.basePrice,
    cleaning_fee:     listing.cleaningFee,
    security_deposit: listing.securityDeposit,
    guest_no:         listing.guestNo,
    bedroom_no:       listing.bedroomNo,
    bathroom_no:      listing.bathroomNo,
    size:             (listing as unknown as Record<string,unknown>).size,
    street:           listing.street,
    city:             listing.city,
    state:            listing.state,
    available_from:   listing.avaliableFrom,
    available_until:  listing.avaliableUntil,
    additional_rules: (listing as unknown as Record<string,unknown>).additionalRules,
  };

  const changedCount = FIELD_LABELS.filter(({ key }) => fmt(snap[key]) !== fmt(current[key]) && !(PRICE_FIELDS.has(key) ? naira(snap[key]) === naira(current[key]) : false)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                Edited — awaiting re-approval
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">{listing.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {changedCount} field{changedCount !== 1 ? "s" : ""} changed · Host: {listing.userId.fullName}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diff table */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 w-36">Field</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Before</th>
                <th className="px-3 py-3 w-8" />
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {FIELD_LABELS.map(({ key, label }) => (
                <DiffRow
                  key={key}
                  label={label}
                  before={snap[key]}
                  after={current[key]}
                  isPriceField={PRICE_FIELDS.has(key)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button
            onClick={onReject}
            disabled={isRejecting || isApproving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {isRejecting ? "Rejecting…" : "Reject changes"}
          </button>
          <button
            onClick={onApprove}
            disabled={isApproving || isRejecting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {isApproving ? "Approving…" : "Approve & publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
