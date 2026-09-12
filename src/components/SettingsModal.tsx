import React, { useState, useRef } from 'react';
import {
  Settings,
  X,
  Save,
  Download,
  Upload,
  RotateCcw,
  Store,
  Building,
  CreditCard,
  FileText,
  Printer,
  CheckCircle,
  AlertCircle,
  QrCode,
  ShieldAlert,
} from 'lucide-react';
import { StoreSettings } from '../types';
import { exportBackupData, importBackupData, resetToFactoryDefaults } from '../utils/storage';

interface SettingsModalProps {
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings: (settings: StoreSettings) => void;
  onDataRestored: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSaveSettings,
  onDataRestored,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [termsText, setTermsText] = useState(settings.terms.join('\n'));
  const [activeTab, setActiveTab] = useState<'store' | 'bank' | 'invoice' | 'backup'>('store');
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTerms = termsText
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const updated: StoreSettings = {
      ...formData,
      storeName: formData.storeName.trim() || 'Jyoti Electronics',
      terms: parsedTerms,
    };

    onSaveSettings(updated);
    onClose();
  };

  const handleDownloadBackup = () => {
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

      setBackupStatus({
        type: 'success',
        message: 'JSON backup file successfully generated and downloaded!',
      });
    } catch (err) {
      setBackupStatus({
        type: 'error',
        message: 'Failed to create backup: ' + (err as Error).message,
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importBackupData(content);
      if (result.success) {
        setBackupStatus({ type: 'success', message: result.message });
        onDataRestored();
      } else {
        setBackupStatus({ type: 'error', message: result.message });
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  const handleFactoryReset = () => {
    if (
      window.confirm(
        'Are you sure you want to reset Jyoti Electronics to factory sample data? This will restore initial products and bills.'
      )
    ) {
      resetToFactoryDefaults();
      setBackupStatus({
        type: 'success',
        message: 'Database reset to default sample records.',
      });
      onDataRestored();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Store Settings & Data Backup
              </h3>
              <p className="text-xs text-slate-500">
                Configure GSTIN, store branding, payment details & backups
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'store'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Store Profile & Tax
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'bank'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Bank & UPI QR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invoice')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'invoice'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Invoice & Terms
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Backup & Restore
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {backupStatus && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                backupStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {backupStatus.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{backupStatus.message}</span>
            </div>
          )}

          {/* TAB 1: Store Details */}
          {activeTab === 'store' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder="e.g. Jyoti Electronics"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. Sales, Service & Accessories"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Store Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Shop No, Street, Landmark (Optional)"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City / Town (Optional)"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    State & Pincode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="State (Optional)"
                      className="w-full px-2.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="Pincode (Optional)"
                      className="w-full px-2.5 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Primary Contact / Helpline Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210 (Optional)"
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Displayed as "Helpline" in the top bar and on printed customer invoices.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alt Contact / Landline
                  </label>
                  <input
                    type="tel"
                    value={formData.altPhone}
                    onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                    placeholder="Alt Phone (Optional)"
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    GSTIN / Tax ID
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    placeholder="15-digit GSTIN (Optional)"
                    className="w-full px-3 py-2 text-sm font-mono uppercase font-bold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    GST State Code
                  </label>
                  <input
                    type="text"
                    value={formData.stateCode}
                    onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                    placeholder="e.g. 22 (Optional)"
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Bank & UPI QR */}
          {activeTab === 'bank' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    UPI ID (VPA) for Printed Invoices
                  </label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    placeholder="e.g. jyotielectronics@upi (Optional)"
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Leave blank if you do not want a UPI payment QR code printed on bills.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="Bank Name (Optional)"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="Account Number (Optional)"
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="IFSC Code (Optional)"
                    className="w-full px-3 py-2 text-sm font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4 mt-2">
                <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg p-1.5 flex items-center justify-center shrink-0">
                  <QrCode className="w-12 h-12 text-slate-800" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    Dynamic QR Code Preview
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {formData.upiId ? (
                      <>A scannable UPI code linked to <span className="font-mono font-semibold">{formData.upiId}</span> will appear on printed bills.</>
                    ) : (
                      <>UPI ID is currently blank. No QR code will be displayed on printed bills.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Invoice & Terms */}
          {activeTab === 'invoice' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={formData.invoicePrefix}
                    onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">e.g. JE-2026-</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Default Print Layout
                  </label>
                  <select
                    value={formData.printFormat}
                    onChange={(e) =>
                      setFormData({ ...formData, printFormat: e.target.value as 'a4' | 'thermal' })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="a4">Standard A4 Tax Invoice</option>
                    <option value="thermal">3-inch (80mm) Thermal POS Receipt</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Invoice Terms & Conditions (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={termsText}
                    onChange={(e) => setTermsText(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Backup & Restore */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-900 text-xs">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Download Complete Store Backup</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Export all your current inventory items, sales records, GST invoices, and store branding to a standalone, secure JSON file. Store backups on your flash drive or cloud drive anytime.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="mt-1 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON Backup File</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Restore From JSON Backup</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Select a previously downloaded Jyoti Electronics backup file (`.json`) to restore your catalog and invoice history.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select Backup File to Restore</span>
                </button>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                  <RotateCcw className="w-4 h-4 text-amber-700" />
                  <span>Reset to Factory Sample Records</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Restore pre-loaded demo inventory (Samsung phones, Sony TVs, Audio, Appliances) and default Jyoti Electronics configuration.
                </p>
                <button
                  type="button"
                  onClick={handleFactoryReset}
                  className="mt-1 flex items-center gap-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs px-4 py-2 rounded-lg transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Sample Data</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Save */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
