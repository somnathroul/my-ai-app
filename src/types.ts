export type GstRate = 0 | 5 | 12 | 18 | 28;

export type ProductCategory =
  | 'Mobile'
  | 'TV'
  | 'Audio'
  | 'Home Appliance'
  | 'Kitchen Appliance'
  | 'Accessories'
  | 'Spares & Repair'
  | 'Other';

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  altPhone: string;
  email: string;
  gstin: string;
  stateCode: string;
  upiId: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  terms: string[];
  invoicePrefix: string;
  invoiceCounter: number;
  printFormat: 'a4' | 'thermal';
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  hsn: string;
  serialNumbers: string[]; // IMEI or Serial numbers currently in stock
  costPrice: number;
  sellingPrice: number; // Base selling rate before GST or base rate
  isPriceTaxInclusive: boolean; // Flag to indicate whether sellingPrice includes GST
  gstRate: GstRate;
  stock: number;
  minStockAlert: number;
  unit: string; // Pcs, Set, Box, Meter
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  name: string;
  brand?: string;
  category?: string;
  hsn: string;
  serialNo?: string; // Optional IMEI/Serial number for this specific billed unit
  quantity: number;
  unit: string;
  rate: number; // Taxable rate per unit
  discount: number; // Line discount
  taxableAmount: number;
  gstRate: GstRate;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  total: number;
}

export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Credit / Due' | 'Split';

export interface PaymentDetails {
  mode: PaymentMode;
  amountReceived: number;
  cashAmount?: number;
  upiAmount?: number;
  cardAmount?: number;
  dueAmount?: number;
  transactionRef?: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address?: string;
  gstin?: string;
  state?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  time: string;
  customer: CustomerDetails;
  items: InvoiceItem[];
  isInterState: boolean; // Whether to charge IGST instead of CGST+SGST
  taxableTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  totalGst: number;
  discountType: 'flat' | 'percent';
  discountValue: number;
  discountAmount: number;
  roundOff: number;
  grandTotal: number;
  grandTotalInWords: string;
  payment: PaymentDetails;
  status: 'active' | 'void';
  voidReason?: string;
  notes?: string;
  createdAt: string;
}

export type ActiveTab = 'pos' | 'inventory' | 'invoices' | 'reports' | 'settings';
