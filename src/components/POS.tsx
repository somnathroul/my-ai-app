import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Printer,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Smartphone,
  Tag,
  CreditCard,
  User,
  Phone,
  MapPin,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ArrowRight,
  Hash,
} from 'lucide-react';
import {
  Product,
  StoreSettings,
  Invoice,
  InvoiceItem,
  GstRate,
  PaymentMode,
  CustomerDetails,
  ProductCategory,
} from '../types';
import { numberToIndianWords, formatCurrency } from '../utils/numberToWords';
import { generateNextInvoiceNumber } from '../utils/storage';

interface POSProps {
  products: Product[];
  settings: StoreSettings;
  pastInvoices: Invoice[];
  onSaveInvoice: (invoice: Invoice, shouldPrint: boolean) => void;
  onUpdateProducts: (updatedProducts: Product[]) => void;
}

export const POS: React.FC<POSProps> = ({
  products,
  settings,
  pastInvoices,
  onSaveInvoice,
  onUpdateProducts,
}) => {
  // Customer State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  // Cart Items State
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Search & Catalog Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isInterState, setIsInterState] = useState(false);

  // Discount & Payment State
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [upiAmount, setUpiAmount] = useState<number>(0);
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');

  // Custom Quick Item Modal State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customHsn, setCustomHsn] = useState('8529');
  const [customRate, setCustomRate] = useState<number>(500);
  const [customGst, setCustomGst] = useState<GstRate>(18);
  const [customSerial, setCustomSerial] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Derive unique past customers for quick autocomplete
  const pastCustomers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; address?: string; gstin?: string }>();
    pastInvoices.forEach((inv) => {
      if (inv.customer && inv.customer.phone && inv.customer.name) {
        map.set(inv.customer.phone, {
          name: inv.customer.name,
          phone: inv.customer.phone,
          address: inv.customer.address,
          gstin: inv.customer.gstin,
        });
      }
    });
    return Array.from(map.values());
  }, [pastInvoices]);

  const customerSuggestions = useMemo(() => {
    if (!customerPhone && !customerName) return [];
    const qPhone = customerPhone.trim();
    const qName = customerName.toLowerCase().trim();
    return pastCustomers.filter(
      (c) =>
        (qPhone && c.phone.includes(qPhone)) ||
        (qName && c.name.toLowerCase().includes(qName))
    ).slice(0, 5);
  }, [pastCustomers, customerPhone, customerName]);

  // Filtered Products for fast pick list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.hsn.toLowerCase().includes(q) ||
        p.serialNumbers.some((s) => s.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Add inventory product to cart
  const handleAddToCart = (product: Product, serialNo?: string) => {
    // Check if already in cart
    const existingIndex = items.findIndex(
      (it) => it.productId === product.id && (!serialNo || it.serialNo === serialNo)
    );

    if (existingIndex >= 0) {
      // Increase quantity
      const existing = items[existingIndex];
      const newQty = existing.quantity + 1;
      updateItemQuantity(existing.id, newQty);
    } else {
      // Calculate taxable base rate if price is inclusive
      let taxableRate: number;
      if (product.isPriceTaxInclusive) {
        taxableRate = product.sellingPrice / (1 + product.gstRate / 100);
      } else {
        taxableRate = product.sellingPrice;
      }

      // Pick first serial number from product if available and not selected
      const chosenSerial = serialNo || (product.serialNumbers && product.serialNumbers.length > 0 ? product.serialNumbers[0] : '');

      const taxableAmount = taxableRate * 1;
      const gstFactor = product.gstRate / 100;
      const totalTax = taxableAmount * gstFactor;

      const newItem: InvoiceItem = {
        id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        productId: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        hsn: product.hsn,
        serialNo: chosenSerial,
        quantity: 1,
        unit: product.unit || 'Pcs',
        rate: Number(taxableRate.toFixed(2)),
        discount: 0,
        taxableAmount: Number(taxableAmount.toFixed(2)),
        gstRate: product.gstRate,
        cgstAmount: Number((totalTax / 2).toFixed(2)),
        sgstAmount: Number((totalTax / 2).toFixed(2)),
        igstAmount: Number(totalTax.toFixed(2)),
        total: Number((taxableAmount + totalTax).toFixed(2)),
      };

      setItems((prev) => [...prev, newItem]);
    }
  };

  // Add custom manual item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const rate = Number(customRate) || 0;
    const gstRate = customGst;
    const taxableAmount = rate;
    const totalTax = taxableAmount * (gstRate / 100);

    const newItem: InvoiceItem = {
      id: 'custom-' + Date.now(),
      name: customName.trim(),
      brand: 'Custom / Service',
      category: 'Other',
      hsn: customHsn.trim() || '9987',
      serialNo: customSerial.trim(),
      quantity: 1,
      unit: 'Pcs',
      rate: Number(rate.toFixed(2)),
      discount: 0,
      taxableAmount: Number(taxableAmount.toFixed(2)),
      gstRate,
      cgstAmount: Number((totalTax / 2).toFixed(2)),
      sgstAmount: Number((totalTax / 2).toFixed(2)),
      igstAmount: Number(totalTax.toFixed(2)),
      total: Number((taxableAmount + totalTax).toFixed(2)),
    };

    setItems((prev) => [...prev, newItem]);
    setShowCustomModal(false);
    setCustomName('');
    setCustomSerial('');
    setCustomRate(500);
  };

  // Update item quantity
  const updateItemQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        const taxableAmount = item.rate * newQty;
        const totalTax = taxableAmount * (item.gstRate / 100);

        return {
          ...item,
          quantity: newQty,
          taxableAmount: Number(taxableAmount.toFixed(2)),
          cgstAmount: Number((totalTax / 2).toFixed(2)),
          sgstAmount: Number((totalTax / 2).toFixed(2)),
          igstAmount: Number(totalTax.toFixed(2)),
          total: Number((taxableAmount + totalTax).toFixed(2)),
        };
      })
    );
  };

  // Update item rate
  const updateItemRate = (itemId: string, newRate: number) => {
    const rate = Math.max(0, newRate);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        const taxableAmount = rate * item.quantity;
        const totalTax = taxableAmount * (item.gstRate / 100);

        return {
          ...item,
          rate: Number(rate.toFixed(2)),
          taxableAmount: Number(taxableAmount.toFixed(2)),
          cgstAmount: Number((totalTax / 2).toFixed(2)),
          sgstAmount: Number((totalTax / 2).toFixed(2)),
          igstAmount: Number(totalTax.toFixed(2)),
          total: Number((taxableAmount + totalTax).toFixed(2)),
        };
      })
    );
  };

  // Update item GST rate
  const updateItemGst = (itemId: string, newGst: GstRate) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        const taxableAmount = item.rate * item.quantity;
        const totalTax = taxableAmount * (newGst / 100);

        return {
          ...item,
          gstRate: newGst,
          cgstAmount: Number((totalTax / 2).toFixed(2)),
          sgstAmount: Number((totalTax / 2).toFixed(2)),
          igstAmount: Number(totalTax.toFixed(2)),
          total: Number((taxableAmount + totalTax).toFixed(2)),
        };
      })
    );
  };

  // Update serial number / IMEI
  const updateItemSerial = (itemId: string, serial: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, serialNo: serial } : item))
    );
  };

  // Remove item
  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // Financial calculations
  const calculations = useMemo(() => {
    const taxableTotal = items.reduce((acc, it) => acc + it.taxableAmount, 0);

    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    if (isInterState) {
      igstTotal = items.reduce((acc, it) => acc + it.igstAmount, 0);
    } else {
      cgstTotal = items.reduce((acc, it) => acc + it.cgstAmount, 0);
      sgstTotal = items.reduce((acc, it) => acc + it.sgstAmount, 0);
    }

    const totalGst = isInterState ? igstTotal : cgstTotal + sgstTotal;
    const subtotalWithGst = taxableTotal + totalGst;

    let discountAmount = 0;
    if (discountType === 'percent') {
      discountAmount = (subtotalWithGst * Math.min(100, Math.max(0, discountValue))) / 100;
    } else {
      discountAmount = Math.min(subtotalWithGst, Math.max(0, discountValue));
    }

    const rawGrandTotal = subtotalWithGst - discountAmount;
    const roundedGrandTotal = Math.round(rawGrandTotal);
    const roundOff = Number((roundedGrandTotal - rawGrandTotal).toFixed(2));

    const words = numberToIndianWords(roundedGrandTotal);

    return {
      taxableTotal: Number(taxableTotal.toFixed(2)),
      cgstTotal: Number(cgstTotal.toFixed(2)),
      sgstTotal: Number(sgstTotal.toFixed(2)),
      igstTotal: Number(igstTotal.toFixed(2)),
      totalGst: Number(totalGst.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      roundOff,
      grandTotal: roundedGrandTotal,
      words,
    };
  }, [items, isInterState, discountType, discountValue]);

  // Keep amountReceived in sync when grandTotal changes if using Cash/UPI
  useEffect(() => {
    if (amountReceived === 0 || amountReceived < calculations.grandTotal) {
      setAmountReceived(calculations.grandTotal);
      if (paymentMode === 'Split') {
        const half = Math.floor(calculations.grandTotal / 2);
        setCashAmount(half);
        setUpiAmount(calculations.grandTotal - half);
      }
    }
  }, [calculations.grandTotal]);

  // Handle Save / Print
  const handleGenerateInvoice = (shouldPrint: boolean) => {
    if (items.length === 0) {
      alert('Please add at least one item to generate an invoice.');
      return;
    }

    const finalCustomerName = customerName.trim() || 'Walk-in Customer';
    const finalCustomerPhone = customerPhone.trim() || 'N/A';

    // Generate Invoice Number from sequence
    const { invoiceNumber, updatedSettings } = generateNextInvoiceNumber(settings);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber,
      date: dateStr,
      time: timeStr,
      customer: {
        name: finalCustomerName,
        phone: finalCustomerPhone,
        address: customerAddress.trim() || undefined,
        gstin: customerGstin.trim() || undefined,
      },
      items,
      isInterState,
      taxableTotal: calculations.taxableTotal,
      cgstTotal: calculations.cgstTotal,
      sgstTotal: calculations.sgstTotal,
      igstTotal: calculations.igstTotal,
      totalGst: calculations.totalGst,
      discountType,
      discountValue,
      discountAmount: calculations.discountAmount,
      roundOff: calculations.roundOff,
      grandTotal: calculations.grandTotal,
      grandTotalInWords: calculations.words,
      payment: {
        mode: paymentMode,
        amountReceived: paymentMode === 'Credit / Due' ? 0 : amountReceived,
        cashAmount: paymentMode === 'Cash' ? amountReceived : paymentMode === 'Split' ? cashAmount : undefined,
        upiAmount: paymentMode === 'UPI' ? amountReceived : paymentMode === 'Split' ? upiAmount : undefined,
        dueAmount:
          paymentMode === 'Credit / Due'
            ? calculations.grandTotal
            : Math.max(0, calculations.grandTotal - amountReceived),
        transactionRef: transactionRef.trim() || undefined,
      },
      status: 'active',
      notes: notes.trim() || undefined,
      createdAt: now.toISOString(),
    };

    // Deduct stock from products catalog
    const updatedCatalog = products.map((prod) => {
      const billedItems = items.filter((it) => it.productId === prod.id);
      if (billedItems.length === 0) return prod;

      const totalBilledQty = billedItems.reduce((sum, it) => sum + it.quantity, 0);
      const newStock = Math.max(0, prod.stock - totalBilledQty);

      // Remove used serials if any
      const usedSerials = billedItems.map((it) => it.serialNo).filter(Boolean) as string[];
      const remainingSerials = prod.serialNumbers.filter((sn) => !usedSerials.includes(sn));

      return {
        ...prod,
        stock: newStock,
        serialNumbers: remainingSerials,
        updatedAt: new Date().toISOString(),
      };
    });

    onUpdateProducts(updatedCatalog);
    onSaveInvoice(newInvoice, shouldPrint);

    // Reset Form for next sale
    setItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerGstin('');
    setDiscountValue(0);
    setTransactionRef('');
    setNotes('');
  };

  const handleClearCart = () => {
    if (items.length === 0) return;
    if (window.confirm('Clear current invoice bill items?')) {
      setItems([]);
      setDiscountValue(0);
    }
  };

  const categories: (ProductCategory | 'All')[] = [
    'All',
    'Mobile',
    'TV',
    'Audio',
    'Home Appliance',
    'Kitchen Appliance',
    'Accessories',
    'Spares & Repair',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            LEFT COLUMN: ITEM SELECTION & PRODUCT CATALOG (7 cols on lg)
            ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Customer Details Card */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Customer Information
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCustomerName('Walk-in Customer');
                  setCustomerPhone('9999999999');
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition cursor-pointer"
              >
                + Quick Walk-in
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
              {/* Customer Phone */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mobile Number <span className="text-slate-400 font-normal">(for SMS/Bill)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="input-customer-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      setShowCustomerSuggestions(true);
                    }}
                    onFocus={() => setShowCustomerSuggestions(true)}
                    placeholder="10-digit Mobile No."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Customer Name */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Customer Name
                </label>
                <input
                  id="input-customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setShowCustomerSuggestions(true);
                  }}
                  onFocus={() => setShowCustomerSuggestions(true)}
                  placeholder="e.g. Ramesh Verma"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {showCustomerSuggestions && customerSuggestions.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden divide-y divide-slate-100">
                  <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-bold text-slate-500 flex justify-between">
                    <span>Recent Customers</span>
                    <button
                      type="button"
                      onClick={() => setShowCustomerSuggestions(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Close
                    </button>
                  </div>
                  {customerSuggestions.map((cust, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCustomerName(cust.name);
                        setCustomerPhone(cust.phone);
                        if (cust.address) setCustomerAddress(cust.address);
                        if (cust.gstin) setCustomerGstin(cust.gstin);
                        setShowCustomerSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between transition cursor-pointer text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{cust.name}</div>
                        <div className="text-slate-500 font-mono">{cust.phone}</div>
                      </div>
                      {cust.address && (
                        <div className="text-[11px] text-slate-400 max-w-[150px] truncate">
                          {cust.address}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Address (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  City / Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="input-customer-address"
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="e.g. Civil Lines, Raipur"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              {/* Customer GSTIN (Optional B2B) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Customer GSTIN <span className="text-slate-400 font-normal">(Optional for B2B)</span>
                </label>
                <input
                  id="input-customer-gstin"
                  type="text"
                  value={customerGstin}
                  onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                  placeholder="15-digit GSTIN"
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition uppercase"
                />
              </div>
            </div>
          </div>

          {/* Product Catalog Picker */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  ref={searchInputRef}
                  id="input-search-products"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search item by name, brand, HSN or IMEI..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600 p-1"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                id="btn-add-custom-item"
                type="button"
                onClick={() => setShowCustomModal(true)}
                className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 transition cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Custom / Service Item</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-slate-400 text-xs">
                  No products matching "{searchQuery}". Click "+ Custom Item" to bill an unlisted product.
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const isLowStock = prod.stock <= prod.minStockAlert;
                  const isOutOfStock = prod.stock <= 0;

                  return (
                    <div
                      key={prod.id}
                      className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                        isOutOfStock
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                            {prod.brand}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isOutOfStock
                                ? 'bg-red-100 text-red-700'
                                : isLowStock
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {isOutOfStock
                              ? 'Out of Stock'
                              : isLowStock
                              ? `Low: ${prod.stock} left`
                              : `${prod.stock} in stock`}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 mt-0.5 leading-snug">
                          {prod.name}
                        </h4>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                          <span>HSN: {prod.hsn}</span>
                          <span>•</span>
                          <span>GST {prod.gstRate}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <div className="font-mono font-bold text-sm text-slate-900">
                          ₹{prod.sellingPrice.toLocaleString('en-IN')}
                        </div>

                        {prod.serialNumbers && prod.serialNumbers.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleAddToCart(prod, prod.serialNumbers[0])}
                              className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(prod)}
                            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: CURRENT INVOICE / CART & CHECKOUT (5 cols on lg)
            ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            {/* Cart Header */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm tracking-wide">
                  Current Bill Items ({items.length})
                </h3>
                <p className="text-[11px] text-slate-400">
                  {customerName || 'Walk-in'} {customerPhone && `• ${customerPhone}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsInterState(!isInterState)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded transition cursor-pointer ${
                    isInterState
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title="Toggle Inter-State IGST vs Local CGST+SGST"
                >
                  {isInterState ? 'Inter-State (IGST)' : 'Local (CGST+SGST)'}
                </button>

                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="text-slate-400 hover:text-red-400 p-1 transition cursor-pointer"
                    title="Clear bill items"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Cart Items List */}
            <div className="p-3 max-h-[360px] overflow-y-auto divide-y divide-slate-100">
              {items.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="w-10 h-10 mx-auto mb-2 text-slate-300 flex items-center justify-center bg-slate-50 rounded-full border border-slate-200">
                    <Tag className="w-5 h-5" />
                  </div>
                  No items in current bill yet.<br />
                  Select products on the left or click "+ Custom Item".
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-900 leading-snug">
                          {idx + 1}. {item.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>HSN: {item.hsn}</span>
                          <span>•</span>
                          <span>Rate: ₹{item.rate.toFixed(2)}</span>
                          <span>•</span>
                          <span>GST {item.gstRate}%</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-slate-900">
                          ₹{item.total.toFixed(2)}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[11px] text-red-500 hover:text-red-700 font-medium transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* IMEI / Serial Input for high-value electronics */}
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-md border border-slate-200">
                      <Smartphone className="w-3 h-3 text-slate-400 ml-1 shrink-0" />
                      <input
                        type="text"
                        value={item.serialNo || ''}
                        onChange={(e) => updateItemSerial(item.id, e.target.value)}
                        placeholder="IMEI / Serial No. (Optional)"
                        className="w-full text-[11px] font-mono bg-transparent focus:outline-none text-slate-700 placeholder:text-slate-400"
                      />
                    </div>

                    {/* Quantity & Rate adjustment row */}
                    <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* GST Slab Selector */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-medium">GST:</span>
                        <select
                          value={item.gstRate}
                          onChange={(e) => updateItemGst(item.id, Number(e.target.value) as GstRate)}
                          className="text-xs bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 focus:outline-none font-mono"
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </div>

                      {/* Taxable Amount */}
                      <div className="text-[11px] text-slate-500 font-mono">
                        Taxable: ₹{item.taxableAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Discount Box */}
            <div className="bg-slate-50 p-3.5 border-t border-slate-200 space-y-2 text-xs font-mono">
              {/* Discount Input */}
              <div className="flex items-center justify-between font-sans">
                <span className="text-xs font-semibold text-slate-700">Special Discount:</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex border border-slate-300 rounded-md overflow-hidden bg-white text-xs">
                    <button
                      type="button"
                      onClick={() => setDiscountType('flat')}
                      className={`px-2 py-0.5 font-bold transition cursor-pointer ${
                        discountType === 'flat' ? 'bg-blue-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      ₹ Flat
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percent')}
                      className={`px-2 py-0.5 font-bold transition cursor-pointer ${
                        discountType === 'percent' ? 'bg-blue-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      %
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-16 px-2 py-1 text-right text-xs bg-white border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tax & Subtotal Breakdown */}
              <div className="border-t border-slate-200 pt-2 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Taxable Subtotal:</span>
                  <span>₹{calculations.taxableTotal.toFixed(2)}</span>
                </div>

                {!isInterState ? (
                  <>
                    <div className="flex justify-between text-[11px]">
                      <span>CGST Total:</span>
                      <span>₹{calculations.cgstTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>SGST Total:</span>
                      <span>₹{calculations.sgstTotal.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-[11px]">
                    <span>IGST Total:</span>
                    <span>₹{calculations.igstTotal.toFixed(2)}</span>
                  </div>
                )}

                {calculations.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount:</span>
                    <span>-₹{calculations.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {calculations.roundOff !== 0 && (
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Round Off:</span>
                    <span>{calculations.roundOff > 0 ? `+${calculations.roundOff.toFixed(2)}` : calculations.roundOff.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total Banner */}
              <div className="border-t-2 border-slate-900 pt-2 flex items-baseline justify-between font-sans">
                <span className="text-sm font-black text-slate-900">GRAND TOTAL:</span>
                <span className="text-2xl font-black text-blue-900 font-mono">
                  ₹{calculations.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-sans italic line-clamp-1">
                {calculations.words}
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="p-3.5 bg-white border-t border-slate-200 space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Payment Mode
              </label>

              <div className="grid grid-cols-5 gap-1">
                {(['Cash', 'UPI', 'Card', 'Credit / Due', 'Split'] as PaymentMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-1.5 px-1 text-center rounded-lg text-xs font-bold transition cursor-pointer border ${
                      paymentMode === mode
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mode === 'Credit / Due' ? 'Credit' : mode}
                  </button>
                ))}
              </div>

              {/* Payment Details Inputs */}
              {paymentMode === 'Split' ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Cash Amount (₹)</label>
                    <input
                      type="number"
                      value={cashAmount || ''}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setCashAmount(val);
                        setUpiAmount(Math.max(0, calculations.grandTotal - val));
                      }}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">UPI Amount (₹)</label>
                    <input
                      type="number"
                      value={upiAmount || ''}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setUpiAmount(val);
                        setCashAmount(Math.max(0, calculations.grandTotal - val));
                      }}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono text-sm"
                    />
                  </div>
                </div>
              ) : paymentMode === 'Credit / Due' ? (
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 font-medium">
                  This bill will be recorded as Outstanding Due (₹{calculations.grandTotal.toLocaleString('en-IN')}) for {customerName || 'customer'}.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Amount Tendered (₹)</label>
                    <input
                      type="number"
                      value={amountReceived || ''}
                      onChange={(e) => setAmountReceived(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      {amountReceived >= calculations.grandTotal ? 'Change to Return' : 'Balance Due'}
                    </label>
                    <div className={`py-1.5 px-2 font-mono font-bold text-sm rounded border ${
                      amountReceived >= calculations.grandTotal
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      ₹{Math.abs(amountReceived - calculations.grandTotal).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Ref */}
              {(paymentMode === 'UPI' || paymentMode === 'Card' || paymentMode === 'Split') && (
                <div>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Transaction ID / UTR / Card Auth Code (Optional)"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded font-mono placeholder:font-sans focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Quick Checkout Actions */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-2">
              <button
                id="btn-save-print"
                type="button"
                onClick={() => handleGenerateInvoice(true)}
                disabled={items.length === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer text-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Save & Print</span>
              </button>

              <button
                id="btn-save-only"
                type="button"
                onClick={() => handleGenerateInvoice(false)}
                disabled={items.length === 0}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Bill</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CUSTOM ITEM MODAL (FOR SERVICES, UNLISTED ACCESSORIES, REPAIRS)
          ========================================================================= */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Add Custom / Service Line Item
                </h3>
                <p className="text-xs text-slate-500">
                  Bill repair services, tempered glass, or unlisted spares
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item / Service Description *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Mobile Screen Replacement, Type-C Cable"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    HSN / SAC Code
                  </label>
                  <input
                    type="text"
                    value={customHsn}
                    onChange={(e) => setCustomHsn(e.target.value)}
                    placeholder="e.g. 9987 (Service)"
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GST Rate
                  </label>
                  <select
                    value={customGst}
                    onChange={(e) => setCustomGst(Number(e.target.value) as GstRate)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Taxable Rate (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={customRate}
                    onChange={(e) => setCustomRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Serial / IMEI (Optional)
                  </label>
                  <input
                    type="text"
                    value={customSerial}
                    onChange={(e) => setCustomSerial(e.target.value)}
                    placeholder="S/N or IMEI"
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-blue-50 text-blue-900 rounded-lg text-xs font-medium flex justify-between">
                <span>Calculated Total (with {customGst}% GST):</span>
                <span className="font-mono font-bold">
                  ₹{(customRate * (1 + customGst / 100)).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-xs cursor-pointer"
                >
                  Add to Current Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
