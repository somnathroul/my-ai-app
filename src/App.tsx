import React, { useState, useEffect, useMemo } from 'react';
import {
  ActiveTab,
  StoreSettings,
  Product,
  Invoice,
} from './types';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredProducts,
  saveStoredProducts,
  getStoredInvoices,
  saveStoredInvoices,
  exportBackupData,
} from './utils/storage';
import { Header } from './components/Header';
import { POS } from './components/POS';
import { Inventory } from './components/Inventory';
import { InvoiceHistory } from './components/InvoiceHistory';
import { Reports } from './components/Reports';
import { SettingsModal } from './components/SettingsModal';
import { PrintableInvoice } from './components/PrintableInvoice';

export default function App() {
  // Primary state loaded from LocalStorage
  const [settings, setSettings] = useState<StoreSettings>(() => getStoredSettings());
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStoredInvoices());

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeInvoiceToPrint, setActiveInvoiceToPrint] = useState<Invoice | null>(null);

  // Sync settings when modified
  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Sync products when modified
  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    saveStoredProducts(newProducts);
  };

  // Sync invoices when modified
  const handleUpdateInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    saveStoredInvoices(newInvoices);
  };

  // When a new sale is completed
  const handleSaveInvoice = (newInvoice: Invoice, shouldPrint: boolean) => {
    const updated = [newInvoice, ...invoices];
    handleUpdateInvoices(updated);

    if (shouldPrint) {
      setActiveInvoiceToPrint(newInvoice);
      // Small timeout to allow DOM to render printable layout before triggering print dialog
      setTimeout(() => {
        window.print();
      }, 350);
    } else {
      setActiveInvoiceToPrint(newInvoice);
    }
  };

  // Voiding an invoice & restoring product stocks
  const handleVoidInvoice = (invoiceId: string, reason: string) => {
    const targetInvoice = invoices.find((inv) => inv.id === invoiceId);
    if (!targetInvoice || targetInvoice.status === 'void') return;

    // 1. Mark invoice as void
    const updatedInvoices = invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, status: 'void' as const, voidReason: reason } : inv
    );
    handleUpdateInvoices(updatedInvoices);

    // 2. Restore inventory quantities
    const updatedProducts = products.map((prod) => {
      const billedItems = targetInvoice.items.filter((it) => it.productId === prod.id);
      if (billedItems.length === 0) return prod;

      const restoredQty = billedItems.reduce((acc, it) => acc + it.quantity, 0);
      const restoredSerials = billedItems
        .map((it) => it.serialNo)
        .filter(Boolean) as string[];

      const combinedSerials = Array.from(
        new Set([...prod.serialNumbers, ...restoredSerials])
      );

      return {
        ...prod,
        stock: prod.stock + restoredQty,
        serialNumbers: combinedSerials,
        updatedAt: new Date().toISOString(),
      };
    });

    handleUpdateProducts(updatedProducts);
  };

  // Data restored from backup
  const handleDataRestored = () => {
    setSettings(getStoredSettings());
    setProducts(getStoredProducts());
    setInvoices(getStoredInvoices());
  };

  // Quick backup download
  const handleQuickBackup = () => {
    try {
      const jsonStr = exportBackupData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Jyoti_Electronics_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download backup: ' + (err as Error).message);
    }
  };

  // Count low stock items for visual alert badge
  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= p.minStockAlert).length;
  }, [products]);

  // Keyboard shortcut support (F2 -> POS, F3 -> Inventory, F4 -> Invoices)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('pos');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('inventory');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('invoices');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top App Header & Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        settings={settings}
        lowStockCount={lowStockCount}
        totalInvoicesCount={invoices.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onQuickBackup={handleQuickBackup}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'pos' && (
          <POS
            products={products}
            settings={settings}
            pastInvoices={invoices}
            onSaveInvoice={handleSaveInvoice}
            onUpdateProducts={handleUpdateProducts}
          />
        )}

        {activeTab === 'inventory' && (
          <Inventory
            products={products}
            onUpdateProducts={handleUpdateProducts}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoiceHistory
            invoices={invoices}
            products={products}
            settings={settings}
            onViewInvoice={(inv) => setActiveInvoiceToPrint(inv)}
            onVoidInvoice={handleVoidInvoice}
          />
        )}

        {activeTab === 'reports' && (
          <Reports invoices={invoices} products={products} />
        )}
      </main>

      {/* Printable Invoice Modal / Print Sheet */}
      {activeInvoiceToPrint && (
        <PrintableInvoice
          invoice={activeInvoiceToPrint}
          settings={settings}
          onClose={() => setActiveInvoiceToPrint(null)}
        />
      )}

      {/* Settings & Backup Modal */}
      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSettings={handleUpdateSettings}
        onDataRestored={handleDataRestored}
      />

      {/* Screen Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-800">{settings.storeName}</span> POS & GST Billing System • Local-First Architecture
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Shortcuts: F2 (POS) • F3 (Inventory) • F4 (Invoices)</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-blue-600 underline cursor-pointer"
            >
              Configure Store
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
