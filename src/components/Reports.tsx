import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  TrendingUp,
  Percent,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { Invoice, Product } from '../types';

interface ReportsProps {
  invoices: Invoice[];
  products: Product[];
}

export const Reports: React.FC<ReportsProps> = ({ invoices, products }) => {
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'this_month'>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonthStr = todayStr.substring(0, 7); // YYYY-MM

  // Filtered active invoices
  const activeInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (inv.status !== 'active') return false;
      if (periodFilter === 'today') return inv.date === todayStr;
      if (periodFilter === 'this_month') return inv.date.startsWith(thisMonthStr);
      return true;
    });
  }, [invoices, periodFilter, todayStr, thisMonthStr]);

  // Overall Financials
  const overall = useMemo(() => {
    const totalSales = activeInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const taxableTotal = activeInvoices.reduce((sum, i) => sum + i.taxableTotal, 0);
    const totalGst = activeInvoices.reduce((sum, i) => sum + i.totalGst, 0);
    const totalCgst = activeInvoices.reduce((sum, i) => sum + i.cgstTotal, 0);
    const totalSgst = activeInvoices.reduce((sum, i) => sum + i.sgstTotal, 0);
    const totalIgst = activeInvoices.reduce((sum, i) => sum + i.igstTotal, 0);
    const totalDiscounts = activeInvoices.reduce((sum, i) => sum + i.discountAmount, 0);

    return {
      totalSales,
      taxableTotal,
      totalGst,
      totalCgst,
      totalSgst,
      totalIgst,
      totalDiscounts,
      invoiceCount: activeInvoices.length,
    };
  }, [activeInvoices]);

  // GST Slab Breakdown (for GSTR-1 preparation)
  const gstBreakdown = useMemo(() => {
    const slabs: Record<number, { taxable: number; cgst: number; sgst: number; igst: number; totalTax: number }> = {
      0: { taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 },
      5: { taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 },
      12: { taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 },
      18: { taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 },
      28: { taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 },
    };

    activeInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const rate = item.gstRate || 0;
        if (!slabs[rate]) {
          slabs[rate] = { taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
        }
        slabs[rate].taxable += item.taxableAmount;
        if (inv.isInterState) {
          slabs[rate].igst += item.igstAmount;
        } else {
          slabs[rate].cgst += item.cgstAmount;
          slabs[rate].sgst += item.sgstAmount;
        }
        slabs[rate].totalTax += item.cgstAmount + item.sgstAmount + item.igstAmount;
      });
    });

    return slabs;
  }, [activeInvoices]);

  // Sales by Category
  const categorySales = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>();
    activeInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const cat = item.category || 'Other';
        const existing = map.get(cat) || { count: 0, revenue: 0 };
        map.set(cat, {
          count: existing.count + item.quantity,
          revenue: existing.revenue + item.total,
        });
      });
    });

    return Array.from(map.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [activeInvoices]);

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    activeInvoices.forEach((inv) => {
      const mode = inv.payment.mode;
      map[mode] = (map[mode] || 0) + inv.grandTotal;
    });
    return map;
  }, [activeInvoices]);

  const handleExportGstrSummary = () => {
    const headers = ['GST Slab Rate', 'Taxable Amount (₹)', 'CGST (₹)', 'SGST (₹)', 'IGST (₹)', 'Total Tax (₹)'];
    const rows = [0, 5, 12, 18, 28].map((rate) => {
      const d = gstBreakdown[rate];
      return [
        `"${rate}%"`,
        d.taxable.toFixed(2),
        d.cgst.toFixed(2),
        d.sgst.toFixed(2),
        d.igst.toFixed(2),
        d.totalTax.toFixed(2),
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [`GST Slab Summary Report for Jyoti Electronics (${periodFilter})`, headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Jyoti_Electronics_GST_Report_${periodFilter}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-6">
      {/* Period Selector & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            GST & Sales Analytics Dashboard
          </h2>
          <p className="text-xs text-slate-500">
            Detailed tax breakdown for GSTR-1 filing, revenue distribution & category analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPeriodFilter('all')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                periodFilter === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter('this_month')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                periodFilter === 'this_month' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter('today')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                periodFilter === 'today' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportGstrSummary}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export GST CSV</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Gross Sales</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            ₹{overall.totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Across {overall.invoiceCount} invoices
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Taxable Turnover</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            ₹{overall.taxableTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Net taxable base
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total GST Output</span>
          <div className="text-2xl font-black text-blue-700 font-mono mt-1">
            ₹{overall.totalGst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            CGST + SGST + IGST
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Discounts Given</span>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            ₹{overall.totalDiscounts.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Customer promotional saving
          </span>
        </div>
      </div>

      {/* GST Slabs Table for Tax Filing */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              GST Slab-wise Tax Summary (GSTR-1 Ready)
            </h3>
            <p className="text-[11px] text-slate-500">
              Official tax collection breakdown by HSN/GST tax percentage
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Form GSTR-1 Format
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">Tax Slab</th>
                <th className="py-2.5 px-3 text-right">Taxable Turnover (₹)</th>
                <th className="py-2.5 px-3 text-right">CGST Collected (₹)</th>
                <th className="py-2.5 px-3 text-right">SGST Collected (₹)</th>
                <th className="py-2.5 px-3 text-right">IGST Collected (₹)</th>
                <th className="py-2.5 px-3 text-right">Total GST Tax (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {[0, 5, 12, 18, 28].map((rate) => {
                const slab = gstBreakdown[rate];
                return (
                  <tr key={rate} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                      GST @ {rate}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-800">
                      ₹{slab.taxable.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      ₹{slab.cgst.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      ₹{slab.sgst.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      ₹{slab.igst.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-900">
                      ₹{slab.totalTax.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <td className="py-3 px-3 font-sans text-slate-950">TOTAL:</td>
                <td className="py-3 px-3 text-right text-slate-950">
                  ₹{overall.taxableTotal.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right text-slate-950">
                  ₹{overall.totalCgst.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right text-slate-950">
                  ₹{overall.totalSgst.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right text-slate-950">
                  ₹{overall.totalIgst.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right text-blue-900 text-sm">
                  ₹{overall.totalGst.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Sales & Payment Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Performance */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900">
              Sales by Category
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              Ranked by Revenue
            </span>
          </div>

          <div className="space-y-2">
            {categorySales.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No category sales recorded yet.
              </div>
            ) : (
              categorySales.map((cat, i) => {
                const pct = overall.totalSales > 0 ? (cat.revenue / overall.totalSales) * 100 : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{cat.category} ({cat.count} sold)</span>
                      <span className="font-mono text-slate-900">
                        ₹{cat.revenue.toLocaleString('en-IN')} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900">
              Payment Mode Volume
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              Cash vs Digital vs Dues
            </span>
          </div>

          <div className="space-y-2.5">
            {Object.keys(paymentBreakdown).length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No payments recorded yet.
              </div>
            ) : (
              Object.entries(paymentBreakdown).map(([mode, rawAmount]) => {
                const amount = Number(rawAmount) || 0;
                const pct = overall.totalSales > 0 ? (amount / overall.totalSales) * 100 : 0;
                return (
                  <div key={mode} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-800">{mode}</div>
                      <div className="text-[11px] text-slate-500">{pct.toFixed(1)}% of total turnover</div>
                    </div>
                    <div className="font-mono font-bold text-sm text-slate-900">
                      ₹{amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
