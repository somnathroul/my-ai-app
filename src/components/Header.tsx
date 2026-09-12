import React from 'react';
import {
  Zap,
  Package,
  Receipt,
  BarChart3,
  Settings,
  Download,
  AlertTriangle,
  Smartphone,
  CheckCircle2,
  Store,
} from 'lucide-react';
import { ActiveTab, StoreSettings } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  settings: StoreSettings;
  lowStockCount: number;
  totalInvoicesCount: number;
  onOpenSettings: () => void;
  onQuickBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  settings,
  lowStockCount,
  totalInvoicesCount,
  onOpenSettings,
  onQuickBackup,
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Store metadata & Quick stats */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            POS System Active
          </span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="hidden sm:inline">
            <span className="text-slate-400">GSTIN: </span>
            <span className="font-mono text-slate-100 font-semibold">{settings.gstin}</span>
          </span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="hidden md:inline text-slate-300">
            {settings.city}, {settings.state} (Code: {settings.stateCode})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {settings.phone ? (
            <span className="text-slate-300">
              Helpline: <span className="font-mono text-white font-medium">{settings.phone}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-slate-400 hover:text-slate-200 text-[11px] underline cursor-pointer"
            >
              + Add Helpline
            </button>
          )}
          <button
            id="btn-quick-backup"
            type="button"
            onClick={onQuickBackup}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer border border-slate-700"
            title="Download complete JSON backup of products and invoices"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Quick Backup</span>
          </button>
        </div>
      </div>

      {/* Main Header with Branding & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Branding Block */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-100">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {settings.storeName}
              </h1>
              <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-200/60 uppercase tracking-wider">
                Retail & POS
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {settings.tagline}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            id="tab-pos"
            type="button"
            onClick={() => onSelectTab('pos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>POS Billing</span>
          </button>

          <button
            id="tab-inventory"
            type="button"
            onClick={() => onSelectTab('inventory')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap cursor-pointer relative ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventory</span>
            {lowStockCount > 0 && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5 ${
                  activeTab === 'inventory'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
                title={`${lowStockCount} items have low stock`}
              >
                <AlertTriangle className="w-3 h-3" />
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            id="tab-invoices"
            type="button"
            onClick={() => onSelectTab('invoices')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Invoices</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-medium ${
                activeTab === 'invoices'
                  ? 'bg-blue-700 text-blue-100'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {totalInvoicesCount}
            </span>
          </button>

          <button
            id="tab-reports"
            type="button"
            onClick={() => onSelectTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reports & GST</span>
          </button>

          <button
            id="btn-open-settings"
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer ml-1 border border-slate-200"
            title="Configure Store Details, Tax ID, Terms and Backup"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
