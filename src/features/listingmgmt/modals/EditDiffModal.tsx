// EditDiffModal.tsx — before/after diff for admin review of edited listings
import { X, ArrowRight, CheckCircle2, XCircle, Loader2, PencilLine, User, MapPin } from "lucide-react";
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
  v != null && v !== "" ? `₦${Number(v).toLocaleString()}` : null;

const fmt = (v: unknown): string | null => {
  if (v == null || v === "") return null;
  if (typeof v === "string") {
    const d = new Date(v);
    if (v.includes("-") && !isNaN(d.getTime()) && v.length <= 10)
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  return String(v);
};

const PRICE_FIELDS = new Set(["base_price", "cleaning_fee", "security_deposit"]);

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

function DiffRow({ label, before, after, isPriceField = false }: {
  label: string;
  before: unknown;
  after: unknown;
  isPriceField?: boolean;
}) {
  const bVal = isPriceField ? naira(before) : fmt(before);
  const aVal = isPriceField ? naira(after)  : fmt(after);
  const changed = bVal !== aVal;
  const isLong = (aVal?.length ?? 0) > 60 || (bVal?.length ?? 0) > 60;

  if (!changed && !bVal && !aVal) return null;

  return (
    <div className={`px-5 py-3.5 ${changed ? "bg-amber-50/60" : "bg-white"} border-b border-gray-100 last:border-0`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
        {changed && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
            changed
          </span>
        )}
      </div>

      {isLong ? (
        /* Stack vertically for long text (description, rules) */
        <div className="space-y-2">
          {bVal && (
            <div className={`text-sm leading-relaxed px-3 py-2 rounded-lg ${changed ? "bg-red-50 text-red-700 line-through decoration-red-400" : "text-gray-700 bg-gray-50"}`}>
              {bVal}
            </div>
          )}
          {changed && aVal && (
            <div className="text-sm leading-relaxed px-3 py-2 rounded-lg bg-green-50 text-green-800 font-medium">
              {aVal}
            </div>
          )}
        </div>
      ) : (
        /* Inline for short values */
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm px-2.5 py-1 rounded-lg ${
            changed
              ? "bg-red-50 text-red-600 line-through decoration-red-400"
              : "bg-gray-100 text-gray-700"
          }`}>
            {bVal ?? <span className="text-gray-300 italic">not set</span>}
          </span>
          {changed && (
            <>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-sm px-2.5 py-1 rounded-lg bg-green-50 text-green-700 font-semibold">
                {aVal ?? <span className="text-gray-300 italic">removed</span>}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function EditDiffModal({ listing, onClose, onApprove, onReject, isApproving, isRejecting }: EditDiffModalProps) {
  const snap = listing.editSnapshot ?? {};

  const current: Record<string, unknown> = {
    name:             listing.name,
    description:      listing.description,
    base_price:       listing.basePrice,
    cleaning_fee:     listing.cleaningFee,
    security_deposit: listing.securityDeposit,
    guest_no:         listing.guestNo,
    bedroom_no:       listing.bedroomNo,
    bathroom_no:      listing.bathroomNo,
    size:             (listing as unknown as Record<string, unknown>).size,
    street:           listing.street,
    city:             listing.city,
    state:            listing.state,
    available_from:   listing.avaliableFrom,
    available_until:  listing.avaliableUntil,
    additional_rules: (listing as unknown as Record<string, unknown>).additionalRules,
  };

  const changedFields = FIELD_LABELS.filter(({ key }) => {
    const bVal = PRICE_FIELDS.has(key) ? naira(snap[key]) : fmt(snap[key]);
    const aVal = PRICE_FIELDS.has(key) ? naira(current[key]) : fmt(current[key]);
    return bVal !== aVal;
  });

  const location = [listing.city, listing.state].filter(Boolean).join(", ");
  const coverImg = listing.listingImg?.[0]?.fileUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-xl bg-white sm:rounded-2xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[88vh] overflow-hidden">

        {/* ── Header ── */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100">
          {/* Cover strip */}
          <div className="relative h-24 bg-gradient-to-br from-amber-400 to-orange-500 overflow-hidden">
            {coverImg && (
              <img
                src={coverImg}
                alt={listing.name}
                className="w-full h-full object-cover opacity-30"
              />
            )}
            <div className="absolute inset-0 flex items-center px-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <PencilLine className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                    Edited · Awaiting re-approval
                  </p>
                  <p className="text-white font-bold text-base leading-tight mt-0.5 drop-shadow">
                    {listing.name}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Meta strip */}
          <div className="flex items-center gap-4 px-5 py-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <User className="w-3.5 h-3.5" />
              <span>{listing.userId.fullName}</span>
            </div>
            {location && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>{location}</span>
              </div>
            )}
            <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {changedFields.length} field{changedFields.length !== 1 ? "s" : ""} changed
            </span>
          </div>
        </div>

        {/* ── Diff body ── */}
        <div className="flex-1 overflow-y-auto">
          {/* Changed-fields section */}
          {changedFields.length > 0 && (
            <div>
              <div className="px-5 pt-4 pb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  What changed
                </p>
              </div>
              <div className="border-t border-gray-100">
                {changedFields.map(({ key, label }) => (
                  <DiffRow
                    key={key}
                    label={label}
                    before={snap[key]}
                    after={current[key]}
                    isPriceField={PRICE_FIELDS.has(key)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Unchanged fields (collapsed hint) */}
          {FIELD_LABELS.length - changedFields.length > 0 && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {FIELD_LABELS.length - changedFields.length} field{FIELD_LABELS.length - changedFields.length !== 1 ? "s" : ""} unchanged
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onReject}
              disabled={isRejecting || isApproving}
              className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              {isRejecting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Rejecting…</>
                : <><XCircle className="w-4 h-4" /> Reject changes</>
              }
            </button>
            <button
              onClick={onApprove}
              disabled={isApproving || isRejecting}
              className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-colors"
              style={{ background: "#1D5C5C" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#174d4d")}
              onMouseLeave={e => (e.currentTarget.style.background = "#1D5C5C")}
            >
              {isApproving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Approving…</>
                : <><CheckCircle2 className="w-4 h-4" /> Approve & publish</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
