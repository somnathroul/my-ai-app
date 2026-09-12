import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Tag,
  Boxes,
  TrendingUp,
  DollarSign,
  Smartphone,
  X,
  Filter,
} from 'lucide-react';
import { Product, ProductCategory, GstRate } from '../types';

interface InventoryProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

export const Inventory: React.FC<InventoryProps> = ({
  products,
  onUpdateProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Mobile');
  const [hsn, setHsn] = useState('8517');
  const [serialInput, setSerialInput] = useState('');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [isPriceTaxInclusive, setIsPriceTaxInclusive] = useState(true);
  const [gstRate, setGstRate] = useState<GstRate>(18);
  const [stock, setStock] = useState<number>(5);
  const [minStockAlert, setMinStockAlert] = useState<number>(3);
  const [unit, setUnit] = useState('Pcs');

  // Statistics
  const stats = useMemo(() => {
    const totalItems = products.length;
    const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
    const totalCostValuation = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);
    const totalRetailValuation = products.reduce((acc, p) => acc + p.sellingPrice * p.stock, 0);
    const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

    return {
      totalItems,
      totalUnits,
      totalCostValuation,
      totalRetailValuation,
      lowStockCount,
    };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesLowStock = !showLowStockOnly || p.stock <= p.minStockAlert;
      const q = searchQuery.toLowerCase().trim();

      if (!q) return matchesCategory && matchesLowStock;

      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.hsn.toLowerCase().includes(q) ||
        p.serialNumbers.some((sn) => sn.toLowerCase().includes(q));

      return matchesCategory && matchesLowStock && matchesSearch;
    });
  }, [products, selectedCategory, showLowStockOnly, searchQuery]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setBrand('');
    setCategory('Mobile');
    setHsn('8517');
    setSerialInput('');
    setCostPrice(0);
    setSellingPrice(0);
    setIsPriceTaxInclusive(true);
    setGstRate(18);
    setStock(5);
    setMinStockAlert(3);
    setUnit('Pcs');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setBrand(prod.brand);
    setCategory(prod.category);
    setHsn(prod.hsn);
    setSerialInput(prod.serialNumbers.join(', '));
    setCostPrice(prod.costPrice);
    setSellingPrice(prod.sellingPrice);
    setIsPriceTaxInclusive(prod.isPriceTaxInclusive ?? true);
    setGstRate(prod.gstRate);
    setStock(prod.stock);
    setMinStockAlert(prod.minStockAlert);
    setUnit(prod.unit || 'Pcs');
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim()) {
      alert('Product name and brand are required.');
      return;
    }

    const serials = serialInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : 'prod-' + Date.now(),
      name: name.trim(),
      brand: brand.trim(),
      category,
      hsn: hsn.trim() || '8529',
      serialNumbers: serials,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      isPriceTaxInclusive,
      gstRate,
      stock: Math.max(0, Number(stock) || 0),
      minStockAlert: Math.max(0, Number(minStockAlert) || 2),
      unit: unit.trim() || 'Pcs',
      updatedAt: new Date().toISOString(),
    };

    if (editingProduct) {
      onUpdateProducts(products.map((p) => (p.id === editingProduct.id ? productPayload : p)));
    } else {
      onUpdateProducts([productPayload, ...products]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to remove "${productName}" from the catalog?`)) {
      onUpdateProducts(products.filter((p) => p.id !== productId));
    }
  };

  const adjustStock = (productId: string, delta: number) => {
    onUpdateProducts(
      products.map((p) => {
        if (p.id !== productId) return p;
        const newStock = Math.max(0, p.stock + delta);
        return { ...p, stock: newStock, updatedAt: new Date().toISOString() };
      })
    );
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
    'Other',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Catalog</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {stats.totalItems}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {stats.totalUnits} total physical units
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Retail Valuation</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            ₹{stats.totalRetailValuation.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">At selling prices</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Cost Valuation</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            ₹{stats.totalCostValuation.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">At purchase costs</div>
        </div>

        <button
          type="button"
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            showLowStockOnly
              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
              : stats.lowStockCount > 0
              ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold">Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono">
            {stats.lowStockCount}
          </div>
          <div className="text-[11px] opacity-90 mt-0.5">
            {showLowStockOnly ? 'Click to show all' : 'Click to filter'}
          </div>
        </button>
      </div>

      {/* Control Bar: Search, Category Filters & Add Product */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-inventory-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name, brand, HSN or IMEI..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-add-product"
              type="button"
              onClick={openAddModal}
              className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs shadow-blue-500/20 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
          {showLowStockOnly && (
            <button
              type="button"
              onClick={() => setShowLowStockOnly(false)}
              className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-200 text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Showing Low Stock</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3">Product Name & Category</th>
                <th className="py-3 px-3 text-center">HSN</th>
                <th className="py-3 px-3 text-center">GST %</th>
                <th className="py-3 px-3 text-right">Cost Price</th>
                <th className="py-3 px-3 text-right">Selling Price</th>
                <th className="py-3 px-3 text-center">Stock Level</th>
                <th className="py-3 px-3 text-center">IMEI / Serials</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLowStock = p.stock <= p.minStockAlert;
                  const isOutOfStock = p.stock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                        <div className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-blue-700">{p.brand}</span>
                          <span>•</span>
                          <span className="bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                            {p.category}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-slate-600">
                        {p.hsn || '-'}
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                        {p.gstRate}%
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        ₹{p.costPrice.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-slate-900 text-sm">
                          ₹{p.sellingPrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.isPriceTaxInclusive ? 'Incl. GST' : '+ GST'}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => adjustStock(p.id, -1)}
                            disabled={p.stock <= 0}
                            className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded text-slate-700 font-bold transition cursor-pointer"
                            title="Decrease stock by 1"
                          >
                            -
                          </button>
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                              isOutOfStock
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : isLowStock
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {p.stock} {p.unit || 'Pcs'}
                          </span>
                          <button
                            type="button"
                            onClick={() => adjustStock(p.id, 1)}
                            className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold transition cursor-pointer"
                            title="Increase stock by 1"
                          >
                            +
                          </button>
                        </div>
                        {isLowStock && (
                          <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                            Min alert: {p.minStockAlert}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {p.serialNumbers && p.serialNumbers.length > 0 ? (
                          <span
                            className="text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200"
                            title={p.serialNumbers.join('\n')}
                          >
                            {p.serialNumbers.length} S/N tracked
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          ADD / EDIT PRODUCT MODAL
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingProduct ? 'Edit Product Catalog Item' : 'Add New Inventory Product'}
                </h3>
                <p className="text-xs text-slate-500">
                  Fill in electronics product details, tax rates & stock levels
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Product Title / Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Samsung Galaxy A55 5G (8GB/128GB)"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Samsung, OnePlus, Sony"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Mobile">Mobile</option>
                    <option value="TV">TV</option>
                    <option value="Audio">Audio</option>
                    <option value="Home Appliance">Home Appliance</option>
                    <option value="Kitchen Appliance">Kitchen Appliance</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Spares & Repair">Spares & Repair</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    value={hsn}
                    onChange={(e) => setHsn(e.target.value)}
                    placeholder="e.g. 8517 (Mobile), 8528 (TV)"
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unit of Measure
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Pcs, Set, Box, Unit"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Pricing & GST Section */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Pricing & GST Tax Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Cost Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={costPrice || ''}
                      onChange={(e) => setCostPrice(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={sellingPrice || ''}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      GST Tax Slab
                    </label>
                    <select
                      value={gstRate}
                      onChange={(e) => setGstRate(Number(e.target.value) as GstRate)}
                      className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk-tax-inclusive"
                    checked={isPriceTaxInclusive}
                    onChange={(e) => setIsPriceTaxInclusive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="chk-tax-inclusive" className="text-slate-700 text-xs font-medium cursor-pointer">
                    Selling Price already includes GST (Standard Retail MRP)
                  </label>
                </div>
              </div>

              {/* Stock & Serial Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock || ''}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Low Stock Alert Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minStockAlert || ''}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    placeholder="Alert when stock falls to..."
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    IMEI / Serial Numbers (Optional, comma-separated)
                  </label>
                  <textarea
                    rows={2}
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    placeholder="e.g. 358901248901231, 358901248901232"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Useful for phones, TVs, and warranties.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-xs cursor-pointer"
                >
                  {editingProduct ? 'Update Product' : 'Save to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
