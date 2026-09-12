import React, { useState } from 'react';
import {
  Printer,
  X,
  Share2,
  Download,
  FileText,
  CreditCard,
  QrCode,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Invoice, StoreSettings } from '../types';
import { formatCurrency } from '../utils/numberToWords';

interface PrintableInvoiceProps {
  invoice: Invoice;
  settings: StoreSettings;
  onClose: () => void;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({
  invoice,
  settings,
  onClose,
}) => {
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>(settings.printFormat || 'a4');
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const itemsList = invoice.items
      .map((item, idx) => `${idx + 1}. ${item.name} (Qty: ${item.quantity}) - ₹${item.total.toLocaleString('en-IN')}`)
      .join('%0A');

    const message = `*Tax Invoice from ${settings.storeName}*%0A` +
      `--------------------------------%0A` +
      `*Invoice No:* ${invoice.invoiceNumber}%0A` +
      `*Date:* ${invoice.date} ${invoice.time}%0A` +
      `*Customer:* ${invoice.customer.name} (${invoice.customer.phone})%0A%0A` +
      `*Items:*%0A${itemsList}%0A%0A` +
      `*Taxable Amount:* ₹${invoice.taxableTotal.toLocaleString('en-IN')}%0A` +
      `*Total GST:* ₹${invoice.totalGst.toLocaleString('en-IN')}%0A` +
      (invoice.discountAmount > 0 ? `*Discount:* -₹${invoice.discountAmount.toLocaleString('en-IN')}%0A` : '') +
      `*Grand Total:* ₹${invoice.grandTotal.toLocaleString('en-IN')}%0A` +
      `*Payment Mode:* ${invoice.payment.mode}%0A` +
      `--------------------------------%0A` +
      `*Thank you for choosing ${settings.storeName}!*%0A` +
      `Helpline: ${settings.phone}`;

    window.open(`https://wa.me/${invoice.customer.phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  const handleCopySummary = () => {
    const summary = `${settings.storeName} - Bill #${invoice.invoiceNumber}\nCustomer: ${invoice.customer.name}\nGrand Total: ₹${invoice.grandTotal.toLocaleString('en-IN')}\nPayment: ${invoice.payment.mode}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:static print:bg-white">
      {/* Top Floating Action Bar (Hidden during print) */}
      <div className="no-print fixed top-3 left-1/2 -translate-x-1/2 z-60 bg-slate-900/90 text-white backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-4 border border-slate-700/80 max-w-[95vw] overflow-x-auto">
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setPrintFormat('a4')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
              printFormat === 'a4' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            A4 Tax Invoice
          </button>
          <button
            type="button"
            onClick={() => setPrintFormat('thermal')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
              printFormat === 'thermal' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            3" Thermal Receipt
          </button>
        </div>

        <button
          id="btn-print-invoice"
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-blue-500/30 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Now</span>
        </button>

        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
          title="Share receipt summary to customer's WhatsApp"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={handleCopySummary}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl transition cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        <button
          id="btn-close-invoice-modal"
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer ml-1"
          title="Close invoice preview"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Invoice Document Container */}
      <div className="mt-14 mb-8 print:mt-0 print:mb-0 w-full flex justify-center">
        {printFormat === 'a4' ? (
          /* =========================================================================
             A4 STANDARD TAX INVOICE FORMAT
             ========================================================================= */
          <div
            id="printable-invoice"
            className="w-full max-w-[840px] bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-300 font-sans print:p-4 print:shadow-none print:border-none print:max-w-none"
          >
            {/* Tax Invoice Header Tag */}
            <div className="border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                <span>Tax Invoice / Cash Memo</span>
                <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
                  Original For Recipient
                </span>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pt-1">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
                    {settings.storeName || 'Jyoti Electronics'}
                  </h1>
                  {settings.tagline && (
                    <p className="text-xs sm:text-sm font-semibold text-blue-800 tracking-wide">
                      {settings.tagline}
                    </p>
                  )}
                  {[
                    settings.address,
                    settings.city,
                    settings.state && settings.pincode
                      ? `${settings.state} - ${settings.pincode}`
                      : settings.state || settings.pincode,
                  ]
                    .filter(Boolean)
                    .join(', ') && (
                    <p className="text-xs text-slate-600 mt-0.5 max-w-md">
                      {[
                        settings.address,
                        settings.city,
                        settings.state && settings.pincode
                          ? `${settings.state} - ${settings.pincode}`
                          : settings.state || settings.pincode,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                  {(settings.phone || settings.altPhone || settings.email) && (
                    <p className="text-xs text-slate-700 font-medium">
                      {settings.phone && (
                        <>Phone: <span className="font-mono font-bold">{settings.phone}</span></>
                      )}
                      {settings.altPhone && ` | Alt: ${settings.altPhone}`}
                      {settings.email && ` | Email: ${settings.email}`}
                    </p>
                  )}
                </div>

                <div className="text-left sm:text-right text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">
                    {settings.gstin ? 'GSTIN / Tax ID:' : 'Tax Status:'}
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-900 tracking-wider">
                    {settings.gstin || 'Composition / Unregistered'}
                  </div>
                  {(settings.state || settings.stateCode) && (
                    <div className="text-[11px] text-slate-600">
                      State: {settings.state || '-'} {settings.stateCode ? `(Code: ${settings.stateCode})` : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Meta and Customer Information Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border border-slate-300 rounded-lg p-3.5 mb-4 bg-slate-50/50">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Billed To (Customer Details):
                </div>
                <div className="font-bold text-sm text-slate-950">
                  {invoice.customer.name || 'Walk-in Customer'}
                </div>
                <div className="text-slate-700 font-medium">
                  Contact: <span className="font-mono">{invoice.customer.phone || 'N/A'}</span>
                </div>
                {invoice.customer.address && (
                  <div className="text-slate-600 mt-0.5">
                    Address: {invoice.customer.address}
                  </div>
                )}
                {invoice.customer.gstin && (
                  <div className="text-slate-800 font-mono font-bold mt-1">
                    Customer GSTIN: {invoice.customer.gstin}
                  </div>
                )}
              </div>

              <div className="sm:border-l sm:border-slate-300 sm:pl-4 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Invoice Metadata:
                  </div>
                  <div className="grid grid-cols-2 gap-y-1">
                    <span className="text-slate-500">Invoice No:</span>
                    <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span>

                    <span className="text-slate-500">Date & Time:</span>
                    <span className="font-mono text-slate-800">{invoice.date} • {invoice.time}</span>

                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="font-semibold text-blue-900">{invoice.payment.mode}</span>

                    <span className="text-slate-500">Place of Supply:</span>
                    <span className="text-slate-800">{invoice.isInterState ? 'Inter-State' : `${settings.state} (${settings.stateCode})`}</span>
                  </div>
                </div>
                {invoice.status === 'void' && (
                  <div className="mt-2 bg-red-100 text-red-800 font-bold px-2 py-1 rounded text-center border border-red-300">
                    VOIDED INVOICE {invoice.voidReason && `(${invoice.voidReason})`}
                  </div>
                )}
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto border border-slate-300 rounded-lg mb-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-2 px-2 text-center w-8">#</th>
                    <th className="py-2 px-2.5">Item Description</th>
                    <th className="py-2 px-2 text-center">HSN</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-2.5 text-right">Rate (₹)</th>
                    <th className="py-2 px-2.5 text-right">Taxable (₹)</th>
                    {invoice.isInterState ? (
                      <th className="py-2 px-2 text-right">IGST</th>
                    ) : (
                      <>
                        <th className="py-2 px-2 text-right">CGST</th>
                        <th className="py-2 px-2 text-right">SGST</th>
                      </>
                    )}
                    <th className="py-2 px-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-2 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-2.5">
                        <div className="font-semibold text-slate-900">
                          {item.name}
                        </div>
                        {item.brand && (
                          <div className="text-[11px] text-slate-500 font-medium">
                            Brand: {item.brand} {item.category ? `• ${item.category}` : ''}
                          </div>
                        )}
                        {item.serialNo && (
                          <div className="text-[11px] font-mono text-blue-700 bg-blue-50/80 inline-block px-1.5 py-0.5 rounded mt-0.5 border border-blue-200/60">
                            IMEI / S.No: <span className="font-bold">{item.serialNo}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-slate-600">
                        {item.hsn || '-'}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-medium">
                        {item.quantity} {item.unit || 'Pcs'}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono text-slate-700">
                        {item.rate.toFixed(2)}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-medium text-slate-900">
                        {item.taxableAmount.toFixed(2)}
                      </td>
                      {invoice.isInterState ? (
                        <td className="py-2 px-2 text-right font-mono text-[11px]">
                          <div>{item.igstAmount.toFixed(2)}</div>
                          <span className="text-slate-400">({item.gstRate}%)</span>
                        </td>
                      ) : (
                        <>
                          <td className="py-2 px-2 text-right font-mono text-[11px]">
                            <div>{item.cgstAmount.toFixed(2)}</div>
                            <span className="text-slate-400">({(item.gstRate / 2).toFixed(1)}%)</span>
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-[11px]">
                            <div>{item.sgstAmount.toFixed(2)}</div>
                            <span className="text-slate-400">({(item.gstRate / 2).toFixed(1)}%)</span>
                          </td>
                        </>
                      )}
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">
                        {item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Summary Section */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-4 text-xs">
              {/* Left Column: Words & Payment Details */}
              <div className="sm:col-span-7 flex flex-col justify-between space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                    Invoice Amount in Words:
                  </span>
                  <p className="font-semibold text-slate-900 italic leading-relaxed">
                    {invoice.grandTotalInWords}
                  </p>
                </div>

                {/* Bank / UPI Payment Info */}
                {(settings.bankName || settings.accountNumber || settings.ifscCode || settings.upiId) && (
                  <div className="border border-slate-200 rounded-lg p-2.5 text-[11px] bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Bank & UPI Payment Details:</span>
                      {settings.bankName && <div>Bank: <span className="font-medium">{settings.bankName}</span></div>}
                      {settings.accountNumber && <div>A/C No: <span className="font-mono font-bold">{settings.accountNumber}</span></div>}
                      {settings.ifscCode && <div>IFSC: <span className="font-mono">{settings.ifscCode}</span></div>}
                      {settings.upiId && <div>UPI ID: <span className="font-mono text-blue-700 font-bold">{settings.upiId}</span></div>}
                    </div>
                    {settings.upiId && (
                      <div className="text-center pl-3 border-l border-slate-200 flex flex-col items-center">
                        <div className="w-14 h-14 bg-white border border-slate-300 rounded p-1 flex items-center justify-center">
                          <QrCode className="w-11 h-11 text-slate-800" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium mt-0.5">Scan & Pay</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Financial Totals */}
              <div className="sm:col-span-5 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Subtotal:</span>
                  <span className="font-semibold text-slate-900">₹{invoice.taxableTotal.toFixed(2)}</span>
                </div>

                {!invoice.isInterState ? (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>Total CGST:</span>
                      <span>₹{invoice.cgstTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Total SGST:</span>
                      <span>₹{invoice.sgstTotal.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-slate-600">
                    <span>Total IGST:</span>
                    <span>₹{invoice.igstTotal.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1">
                  <span>Total Tax (GST):</span>
                  <span className="font-semibold text-slate-800">₹{invoice.totalGst.toFixed(2)}</span>
                </div>

                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount:</span>
                    <span>-₹{invoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {invoice.roundOff !== 0 && (
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Round Off:</span>
                    <span>{invoice.roundOff > 0 ? `+${invoice.roundOff.toFixed(2)}` : invoice.roundOff.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-baseline font-sans">
                  <span className="text-sm font-bold text-slate-900">Grand Total:</span>
                  <span className="text-xl font-extrabold text-blue-900 font-mono">
                    ₹{invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {invoice.payment.mode === 'Credit / Due' && invoice.payment.dueAmount && (
                  <div className="bg-amber-100 text-amber-900 px-2 py-1 rounded text-center font-bold text-[11px] mt-1">
                    Due Balance: ₹{invoice.payment.dueAmount.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>

            {/* Terms & Authorized Signature Block */}
            <div className="border-t border-slate-300 pt-3 grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
              <div className="sm:col-span-8 text-[10px] text-slate-600 leading-relaxed">
                <div className="font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Terms & Conditions:
                </div>
                <ol className="list-decimal pl-3.5 space-y-0.5">
                  {settings.terms.map((term, i) => (
                    <li key={i}>{term}</li>
                  ))}
                </ol>
              </div>

              <div className="sm:col-span-4 flex flex-col justify-between items-end text-right min-h-[70px]">
                <span className="text-[11px] font-bold text-slate-800">
                  For {settings.storeName}
                </span>
                <div className="pt-8 border-t border-dashed border-slate-400 w-36 text-center text-[10px] text-slate-500 font-medium">
                  Authorized Signatory
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 mt-4 border-t border-slate-200 pt-2 print:block">
              Thank you for your business! For service & warranty claims, please bring this bill.
            </div>
          </div>
        ) : (
          /* =========================================================================
             3-INCH (80mm) THERMAL RECEIPT FORMAT
             ========================================================================= */
          <div
            id="printable-invoice"
            className="w-full max-w-[340px] bg-white text-slate-950 p-4 rounded-xl shadow-2xl border border-slate-300 font-mono text-xs print:p-2 print:shadow-none print:border-none print:max-w-none print:w-[80mm]"
          >
            {/* Header */}
            <div className="text-center pb-2 border-b border-dashed border-slate-400">
              <h1 className="text-lg font-black uppercase tracking-tight text-slate-900">
                {settings.storeName || 'Jyoti Electronics'}
              </h1>
              {settings.tagline && <p className="text-[11px] font-bold">{settings.tagline}</p>}
              {[settings.address, settings.city].filter(Boolean).length > 0 && (
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {[settings.address, settings.city].filter(Boolean).join(', ')}
                </p>
              )}
              {settings.phone && <p className="text-[10px] font-bold">Tel: {settings.phone}</p>}
              {settings.gstin && <p className="text-[10px] font-bold mt-0.5">GSTIN: {settings.gstin}</p>}
              <div className="mt-1 font-bold text-[11px] bg-slate-100 py-0.5 uppercase tracking-wider">
                Retail Tax Receipt
              </div>
            </div>

            {/* Bill Details */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>Bill No:</span>
                <span className="font-bold">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{invoice.date} {invoice.time}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-bold truncate max-w-[170px]">{invoice.customer.name || 'Walk-in'}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{invoice.customer.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Pay Mode:</span>
                <span className="font-bold">{invoice.payment.mode}</span>
              </div>
            </div>

            {/* Items */}
            <div className="py-2 border-b border-dashed border-slate-400">
              <div className="flex justify-between font-bold text-[10px] border-b border-slate-300 pb-1 mb-1">
                <span className="w-1/2">ITEM</span>
                <span className="w-1/6 text-center">QTY</span>
                <span className="w-1/3 text-right">TOTAL</span>
              </div>

              {invoice.items.map((item, idx) => (
                <div key={item.id || idx} className="py-1 text-[11px]">
                  <div className="font-bold leading-tight">{item.name}</div>
                  {item.serialNo && (
                    <div className="text-[10px] text-slate-600">S/N: {item.serialNo}</div>
                  )}
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>{item.quantity} x ₹{item.rate.toFixed(2)} (GST {item.gstRate}%)</span>
                    <span className="font-bold text-slate-900">₹{item.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>Taxable Amount:</span>
                <span>₹{invoice.taxableTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total GST:</span>
                <span>₹{invoice.totalGst.toFixed(2)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Discount:</span>
                  <span>-₹{invoice.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {invoice.roundOff !== 0 && (
                <div className="flex justify-between text-[10px]">
                  <span>Round Off:</span>
                  <span>{invoice.roundOff.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black border-t border-slate-900 pt-1 mt-1">
                <span>NET PAYABLE:</span>
                <span>₹{invoice.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* UPI QR & Footer */}
            <div className="text-center pt-2 space-y-1 text-[10px]">
              {settings.upiId && (
                <>
                  <div className="flex justify-center py-1">
                    <QrCode className="w-16 h-16 text-slate-900" />
                  </div>
                  <p className="font-bold">UPI: {settings.upiId}</p>
                </>
              )}
              <p className="text-[9px] text-slate-600 leading-tight">
                * Goods once sold cannot be returned without bill.<br />
                * Warranty as per manufacturer norms only.
              </p>
              <p className="font-bold pt-1">*** THANK YOU VISIT AGAIN ***</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
