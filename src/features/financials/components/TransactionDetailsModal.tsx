import { Modal, type ModalProps } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatCurrencyNGN,
  type FinancialTransaction,
} from "@/data/financialsData";
import { statusToBadgeVariant } from "@/features/financials/utils/status";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: FinancialTransaction | null;
}

export function TransactionDetailsModal({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailsModalProps) {
  if (!transaction) return null;

  const rowsTop = [
    { label: "Transaction ID", value: transaction.id },
    {
      label: "Date",
      value: new Date(transaction.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
    { label: "Type", value: transaction.type },
    { label: "Amount", value: formatCurrencyNGN(transaction.amount) },
  ];

  const rowsBottom = [
    transaction.guestName && {
      label: "Guest Name",
      value: transaction.guestName,
    },
    transaction.hostName && { label: "Host Name", value: transaction.hostName },
    transaction.propertyName && {
      label: "Property Name",
      value: transaction.propertyName,
    },
    transaction.paymentMethod && {
      label: "Payment Method",
      value: transaction.paymentMethod,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  // Receipt generator — same template as the guest-side download in
  // Cribxpert-frontend BookingDetailsPage.tsx so admin and guest PDFs match.
  const handleDownload = () => {
    const t = transaction;
    const bRef = (t as any).bookingId || t.id;
    const propRef = t.propertyName ? t.propertyName : '—';
    const fmt = (n: number) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>CribXpert Receipt - ${bRef}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f9f9f9;color:#1a1a1a;padding:40px}
  .card{max-width:680px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden}
  .header{background:#013e4a;color:#fff;padding:32px 36px}
  .header h1{font-size:24px;font-weight:700;letter-spacing:-0.3px}
  .header p{font-size:13px;opacity:.75;margin-top:4px}
  .badge{display:inline-block;background:rgba(255,255,255,.15);border-radius:20px;padding:4px 14px;font-size:12px;font-weight:600;margin-top:12px}
  .body{padding:32px 36px}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px}
  .meta-item label{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;font-weight:600}
  .meta-item p{font-size:14px;font-weight:600;margin-top:3px;color:#111}
  .divider{border:none;border-top:1px solid #e5e7eb;margin:20px 0}
  table{width:100%;border-collapse:collapse}
  th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;font-weight:600;padding:0 0 10px}
  td{font-size:14px;padding:8px 0;vertical-align:top;color:#374151}
  td:last-child{text-align:right;font-weight:600;color:#111}
  .total-row td{border-top:2px solid #e5e7eb;padding-top:14px;font-size:16px;font-weight:700;color:#013e4a}
  .footer{background:#f3f4f6;padding:20px 36px;font-size:12px;color:#6b7280;text-align:center}
  @media print{body{background:#fff;padding:0}.card{box-shadow:none;border-radius:0}}
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <h1>CribXpert</h1>
    <p>Transaction Receipt</p>
    <span class="badge">${(t.status ?? 'PAID').toString().toUpperCase()}</span>
  </div>
  <div class="body">
    <div class="meta">
      <div class="meta-item"><label>Booking ref</label><p>${bRef}</p></div>
      <div class="meta-item"><label>Property ref</label><p>${propRef}</p></div>
      <div class="meta-item"><label>Property</label><p>${t.propertyName ?? '-'}</p></div>
      <div class="meta-item"><label>Type</label><p>${t.type ?? '-'}</p></div>
      <div class="meta-item"><label>Guest</label><p>${t.guestName ?? '-'}</p></div>
      <div class="meta-item"><label>Host</label><p>${t.hostName ?? '-'}</p></div>
      <div class="meta-item"><label>Payment method</label><p>${t.paymentMethod ?? '-'}</p></div>
      <div class="meta-item"><label>Date paid</label><p>${today}</p></div>
    </div>
    <hr class="divider"/>
    <table>
      <thead><tr><th>Description</th><th></th><th>Amount</th></tr></thead>
      <tbody>
        <tr><td>${t.type ?? 'Transaction'}</td><td></td><td>${fmt(t.amount)}</td></tr>
        <tr class="total-row"><td colspan="2">Total</td><td>${fmt(t.amount)}</td></tr>
      </tbody>
    </table>
    <hr class="divider"/>
    <p style="font-size:12px;color:#6b7280;line-height:1.6">
      Issued by <strong>CribXpert</strong>. Payment processed securely via SZND escrow.
      For support contact <a href="mailto:cribxpert@support.tekktopia.com" style="color:#013e4a">cribxpert@support.tekktopia.com</a>.
    </p>
  </div>
  <div class="footer">(c) ${new Date().getFullYear()} CribXpert - Verified short-lets across Nigeria - RC 9550811</div>
</div>
</body>
</html>`;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Transaction Details'
      size='lg'
      headerAlign='center'
      actions={[] as ModalProps["actions"]}
    >
      <div className='text-left'>
        {/* Top grid */}
        <div className='grid grid-cols-2 gap-y-3 gap-x-8'>
          {rowsTop.map((row) => (
            <div
              key={row.label}
              className='flex items-center justify-between gap-6'
            >
              <span className='text-sm text-gray-500'>{row.label}</span>
              <span className='text-sm text-gray-900 font-medium'>
                {row.value}
              </span>
            </div>
          ))}
          <div className='flex items-center justify-between gap-6'>
            <span className='text-sm text-gray-500'>Status:</span>
            <Badge variant={statusToBadgeVariant(transaction.status)}>
              {transaction.status}
            </Badge>
          </div>
        </div>

        {/* Divider */}
        <hr className='my-5 border-gray-200' />

        {/* Bottom section */}
        <div className='grid grid-cols-2 gap-y-3 gap-x-8'>
          {rowsBottom.map((row) => (
            <div
              key={row.label}
              className='flex items-center justify-between gap-6'
            >
              <span className='text-sm text-gray-500'>{row.label}</span>
              <span className='text-sm text-gray-900 font-medium'>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className='mt-8 flex justify-center'>
          <Button
            onClick={handleDownload}
            className='bg-[#065F6A] hover:bg-[#065F6A]/90 text-white px-6 py-6'
          >
            Download Receipt (PDF)
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default TransactionDetailsModal;
