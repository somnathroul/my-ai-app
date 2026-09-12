import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Calendar,
  Eye,
  Printer,
  Ban,
  Share2,
  FileSpreadsheet,
  ArrowUpDown,
  Filter,
  CreditCard,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Phone,
} from 'lucide-react';
import { Invoice, Product, StoreSettings } from '../types';

interface InvoiceHistoryProps {
  invoices: Invoice[];
  products: Product[];
  settings: StoreSettings;
  onViewInvoice: (invoice: Invoice) => void;
  onVoidInvoice: (invoiceId: string, reason: string) => void;
}

export const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({
  invoices,
  products,
  settings,
  onViewInvoice,
  onVoidInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'void'>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Void confirmation modal
  const [voidTarget, setVoidTarget] = useState<Invoice | null>(null);
  const [voidReason, setVoidReason] = useState('Customer returned item / Billing error');

  // Metrics
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    const activeInvoices = invoices.filter((inv) => inv.status === 'active');
    const totalSales = activeInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    const todayInvoices = activeInvoices.filter((inv) => inv.date === todayStr);
    const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    const totalGstCollected = activeInvoices.reduce((sum, inv) => sum + inv.totalGst, 0);

    const totalOutstandingDues = activeInvoices.reduce((sum, inv) => {
      if (inv.payment.mode === 'Credit / Due' || (inv.payment.dueAmount && inv.payment.dueAmount > 0)) {
        return sum + (inv.payment.dueAmount || 0);
      }
      return sum;
    }, 0);

    return {
      totalSales,
      todaySales,
      todayCount: todayInvoices.length,
      totalCount: invoices.length,
      activeCount: activeInvoices.length,
      voidCount: invoices.filter((i) => i.status === 'void').length,
      totalGstCollected,
      totalOutstandingDues,
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Status filter
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;

      // Payment mode filter
      if (paymentFilter !== 'all' && inv.payment.mode !== paymentFilter) return false;

      // Date filter
      if (dateFilter && inv.date !== dateFilter) return false;

      // Text search
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const matchesNo = inv.invoiceNumber.toLowerCase().includes(q);
      const matchesCust = inv.customer.name.toLowerCase().includes(q);
      const matchesPhone = inv.customer.phone.includes(q);
      const matchesItems = inv.items.some(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          (it.serialNo && it.serialNo.toLowerCase().includes(q))
      );

      return matchesNo || matchesCust || matchesPhone || matchesItems;
    });
  }, [invoices, statusFilter, paymentFilter, dateFilter, searchQuery]);

  const handleConfirmVoid = () => {
    if (!voidTarget) return;
    onVoidInvoice(voidTarget.id, voidReason);
    setVoidTarget(null);
  };

  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) {
      alert('No invoices to export.');
      return;
    }

    const headers = [
      'Invoice No',
      'Date',
      'Time',
      'Customer Name',
      'Phone',
      'Address',
      'Items Count',
      'Taxable Subtotal',
      'CGST',
      'SGST',
      'IGST',
      'Total GST',
      'Discount',
      'Grand Total',
      'Payment Mode',
      'Status',
    ];

    const rows = filteredInvoices.map((inv) => [
      `"${inv.invoiceNumber}"`,
      `"${inv.date}"`,
      `"${inv.time}"`,
      `"${inv.customer.name.replace(/"/g, '""')}"`,
      `"${inv.customer.phone}"`,
      `"${(inv.customer.address || '').replace(/"/g, '""')}"`,
      inv.items.reduce((s, it) => s + it.quantity, 0),
      inv.taxableTotal,
      inv.cgstTotal,
      inv.sgstTotal,
      inv.igstTotal,
      inv.totalGst,
      inv.discountAmount,
      inv.grandTotal,
      `"${inv.payment.mode}"`,
      `"${inv.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Jyoti_Electronics_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Today's Sales</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            ₹{metrics.todaySales.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {metrics.todayCount} bill(s) billed today
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            ₹{metrics.totalSales.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {metrics.activeCount} active tax bills
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total GST Collected</span>
            <Receipt className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            ₹{metrics.totalGstCollected.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">CGST + SGST tax pool</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Outstanding Dues</span>
            <AlertOctagon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 font-mono">
            ₹{metrics.totalOutstandingDues.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Credit sales pending</div>
        </div>
      </div>

      {/* Filter & Action Controls */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-invoice-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice #, customer, phone, IMEI..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Date Picker */}
          <div className="sm:col-span-3 relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-2 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-slate-600 bg-slate-200 px-1 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* Payment Mode Filter */}
          <div className="sm:col-span-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Credit / Due">Credit / Due</option>
              <option value="Split">Split</option>
            </select>
          </div>

          {/* Export CSV Button */}
          <div className="sm:col-span-2 flex justify-end">
            <button
              id="btn-export-csv"
              type="button"
              onClick={handleExportCSV}
              className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({invoices.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active ({metrics.activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('void')}
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer ${
              statusFilter === 'void'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Voided ({metrics.voidCount})
          </button>
        </div>
      </div>

      {/* Invoices Records Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3">Invoice No & Date</th>
                <th className="py-3 px-3">Customer Details</th>
                <th className="py-3 px-3">Items Summary</th>
                <th className="py-3 px-3 text-right">Taxable</th>
                <th className="py-3 px-3 text-right">GST</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
                <th className="py-3 px-3 text-center">Payment</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No matching invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className={`transition hover:bg-slate-50/70 ${
                      inv.status === 'void' ? 'bg-red-50/30 text-slate-500' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {inv.invoiceNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {inv.date} • {inv.time}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">
                        {inv.customer.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {inv.customer.phone}
                      </div>
                      {inv.customer.address && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {inv.customer.address}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">
                        {inv.items.length} item(s) •{' '}
                        {inv.items.reduce((s, it) => s + it.quantity, 0)} units
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                        {inv.items.map((it) => it.name).join(', ')}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      ₹{inv.taxableTotal.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      ₹{inv.totalGst.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        ₹{inv.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      {inv.discountAmount > 0 && (
                        <div className="text-[10px] text-emerald-600">
                          -₹{inv.discountAmount} off
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {inv.payment.mode}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {inv.status === 'void' ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                          Void
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          Paid
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap space-x-1">
                      <button
                        type="button"
                        onClick={() => onViewInvoice(inv)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="View / Re-Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {inv.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => setVoidTarget(inv)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Void bill & return stock"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          VOID BILL CONFIRMATION MODAL
          ========================================================================= */}
      {voidTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Void Invoice #{voidTarget.invoiceNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  This action marks the invoice as void and restores stock quantities.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold">{voidTarget.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bill Amount:</span>
                <span className="font-bold font-mono">₹{voidTarget.grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billed Items to Restore:</span>
                <span className="font-bold">{voidTarget.items.reduce((s, it) => s + it.quantity, 0)} units</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Voiding *
              </label>
              <textarea
                rows={2}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVoidTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVoid}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition shadow-xs cursor-pointer"
              >
                Confirm & Void Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
