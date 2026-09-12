import { Product, StoreSettings, Invoice } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'jyoti_store_settings_v1',
  PRODUCTS: 'jyoti_products_v1',
  INVOICES: 'jyoti_invoices_v1',
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Jyoti Electronics',
  tagline: 'Sales, Service & Accessories',
  address: 'Shop No. 12-14, Commercial Complex, Main Station Road',
  city: 'Raipur',
  state: 'Chhattisgarh',
  pincode: '492001',
  phone: '+91 98261 45012',
  altPhone: '+91 771 4058921',
  email: 'sales@jyotielectronics.in',
  gstin: '22AAACJ1420D1ZQ',
  stateCode: '22',
  upiId: 'jyotielectronics@upi',
  bankName: 'State Bank of India',
  accountNumber: '34910284910',
  ifscCode: 'SBIN0001248',
  terms: [
    'Goods once sold will not be taken back without original tax invoice.',
    'Warranty of mobile phones, appliances & electronics as per manufacturer policy only.',
    'Physical damage, liquid ingress, surge damage, or seal tampering voids all warranties.',
    'Disputes are subject to local city jurisdiction only.',
  ],
  invoicePrefix: 'JE-2026-',
  invoiceCounter: 104,
  printFormat: 'a4',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Samsung Galaxy A55 5G (8GB/128GB)',
    brand: 'Samsung',
    category: 'Mobile',
    hsn: '8517',
    serialNumbers: ['358901248901231', '358901248901232', '358901248901233'],
    costPrice: 24500,
    sellingPrice: 28999,
    isPriceTaxInclusive: true,
    gstRate: 18,
    stock: 7,
    minStockAlert: 3,
    unit: 'Pcs',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'OnePlus Nord CE 4 (8GB/128GB)',
    brand: 'OnePlus',
    category: 'Mobile',
    hsn: '8517',
    serialNumbers: ['864910240182910', '864910240182911'],
    costPrice: 21000,
    sellingPrice: 24999,
    isPriceTaxInclusive: true,
    gstRate: 18,
    stock: 2,
    minStockAlert: 3,
    unit: 'Pcs',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Sony Bravia 43" 4K Google TV (KD-43X74L)',
    brand: 'Sony',
    category: 'TV',
    hsn: '8528',
    serialNumbers: ['SN-SONY-43X74-091', 'SN-SONY-43X74-092'],
    costPrice: 32000,
    sellingPrice: 38490,
    isPriceTaxInclusive: true,
    gstRate: 28,
    stock: 4,
    minStockAlert: 2,
    unit: 'Set',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'LG 32" HD Ready Smart LED TV',
    brand: 'LG',
    category: 'TV',
    hsn: '8528',
    serialNumbers: ['LGTV32-901', 'LGTV32-902', 'LGTV32-903'],
    costPrice: 11500,
    sellingPrice: 13990,
    isPriceTaxInclusive: true,
    gstRate: 28,
    stock: 6,
    minStockAlert: 2,
    unit: 'Set',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    name: 'boAt Airdopes 141 ANC TWS Earbuds',
    brand: 'boAt',
    category: 'Audio',
    hsn: '8518',
    serialNumbers: [],
    costPrice: 950,
    sellingPrice: 1499,
    isPriceTaxInclusive: true,
    gstRate: 18,
    stock: 18,
    minStockAlert: 5,
    unit: 'Pcs',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    name: 'JBL Flip 6 Portable Bluetooth Speaker (20W)',
    brand: 'JBL',
    category: 'Audio',
    hsn: '8518',
    serialNumbers: ['JBL-FLIP6-BLK-041'],
    costPrice: 7800,
    sellingPrice: 9999,
    isPriceTaxInclusive: true,
    gstRate: 18,
    stock: 3,
    minStockAlert: 2,
    unit: 'Pcs',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    name: 'IFB 20L Solo Microwave Oven (20S1)',
    brand: 'IFB',
    category: 'Home Appliance',
    hsn: '8516',
    serialNumbers: ['IFB-MW20S-401'],
    costPrice: 5100,
    sellingPrice: 6290,
    isPriceTaxInclusive: true,
    gstRate: 18,
    stock: 5,
    minStockAlert: 2,
    unit: 'Unit',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    name: 'Havells Stealth Air Ceiling Fan (1200mm)',
    brand: 'Havells',
    category: 'Home Appliance',
    hsn: '8414',
    serialNumbers: [],
    costPrice: 2500,
    sellingPrice: 3150,
    isPriceTaxInclusive: true,
    gstRate: 18,
    stock: 12,
    minStockAlert: 4,
    unit: 'Box',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-9',
    name: 'Bajaj Mixer Grinder GX-1 (500W, 3 Jars)',
    brand: 'Bajaj',
    category: 'Kitchen Appliance',
    hsn: '8509',
    serialNumbers: [],
    costPrice: 1850,
    sellingPrice: 2499,
    isPriceTaxInclusive: true,
    gstRate: 18,
    stock: 1, // Alert! Low stock
    minStockAlert: 3,
    unit: 'Box',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-10',
    name: 'Samsung Original 25W USB-C Super Fast Adapter',
    brand: 'Samsung',
    category: 'Accessories',
    hsn: '8504',
    serialNumbers: [],
    costPrice: 750,
    sellingPrice: 1199,
    isPriceTaxInclusive: true,
    gstRate: 18,
    stock: 2, // Alert! Low stock
    minStockAlert: 5,
    unit: 'Pcs',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-11',
    name: 'SanDisk 128GB Ultra MicroSDXC Card (140MB/s)',
    brand: 'SanDisk',
    category: 'Accessories',
    hsn: '8523',
    serialNumbers: [],
    costPrice: 580,
    sellingPrice: 849,
    isPriceTaxInclusive: true,
    gstRate: 18,
    stock: 22,
    minStockAlert: 6,
    unit: 'Pcs',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-12',
    name: 'LED TV Universal Power Supply Board (SMPS)',
    brand: 'Generic / Spares',
    category: 'Spares & Repair',
    hsn: '8529',
    serialNumbers: [],
    costPrice: 420,
    sellingPrice: 750,
    isPriceTaxInclusive: true,
    gstRate: 18,
    stock: 9,
    minStockAlert: 3,
    unit: 'Pcs',
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'JE-2026-0101',
    date: '2026-09-10',
    time: '11:30 AM',
    customer: {
      name: 'Ramesh Verma',
      phone: '9827156789',
      address: 'Civil Lines, Raipur',
    },
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        name: 'Samsung Galaxy A55 5G (8GB/128GB)',
        brand: 'Samsung',
        category: 'Mobile',
        hsn: '8517',
        serialNo: '358901248901201',
        quantity: 1,
        unit: 'Pcs',
        rate: 24575.42,
        discount: 0,
        taxableAmount: 24575.42,
        gstRate: 18,
        cgstAmount: 2211.79,
        sgstAmount: 2211.79,
        igstAmount: 0,
        total: 28999,
      },
      {
        id: 'item-2',
        productId: 'prod-10',
        name: 'Samsung Original 25W USB-C Super Fast Adapter',
        brand: 'Samsung',
        category: 'Accessories',
        hsn: '8504',
        quantity: 1,
        unit: 'Pcs',
        rate: 1016.1,
        discount: 0,
        taxableAmount: 1016.1,
        gstRate: 18,
        cgstAmount: 91.45,
        sgstAmount: 91.45,
        igstAmount: 0,
        total: 1199,
      },
    ],
    isInterState: false,
    taxableTotal: 25591.52,
    cgstTotal: 2303.24,
    sgstTotal: 2303.24,
    igstTotal: 0,
    totalGst: 4606.48,
    discountType: 'flat',
    discountValue: 0,
    discountAmount: 0,
    roundOff: 0,
    grandTotal: 30198,
    grandTotalInWords: 'Rupees Thirty Thousand One Hundred Ninety-Eight Only',
    payment: {
      mode: 'UPI',
      amountReceived: 30198,
      upiAmount: 30198,
      transactionRef: 'UPI/260910113042/HDFC',
    },
    status: 'active',
    createdAt: '2026-09-10T11:30:00.000Z',
  },
  {
    id: 'inv-102',
    invoiceNumber: 'JE-2026-0102',
    date: '2026-09-11',
    time: '04:15 PM',
    customer: {
      name: 'Sunita Dewangan',
      phone: '9425289123',
      address: 'Pandri, Raipur',
    },
    items: [
      {
        id: 'item-3',
        productId: 'prod-3',
        name: 'Sony Bravia 43" 4K Google TV (KD-43X74L)',
        brand: 'Sony',
        category: 'TV',
        hsn: '8528',
        serialNo: 'SN-SONY-43X74-080',
        quantity: 1,
        unit: 'Set',
        rate: 30070.31,
        discount: 0,
        taxableAmount: 30070.31,
        gstRate: 28,
        cgstAmount: 4209.84,
        sgstAmount: 4209.84,
        igstAmount: 0,
        total: 38490,
      },
    ],
    isInterState: false,
    taxableTotal: 30070.31,
    cgstTotal: 4209.84,
    sgstTotal: 4209.84,
    igstTotal: 0,
    totalGst: 8419.68,
    discountType: 'flat',
    discountValue: 490,
    discountAmount: 490,
    roundOff: 0,
    grandTotal: 38000,
    grandTotalInWords: 'Rupees Thirty-Eight Thousand Only',
    payment: {
      mode: 'Split',
      amountReceived: 38000,
      cashAmount: 18000,
      upiAmount: 20000,
      transactionRef: 'Cash ₹18,000 + GPay ₹20,000',
    },
    status: 'active',
    createdAt: '2026-09-11T16:15:00.000Z',
  },
  {
    id: 'inv-103',
    invoiceNumber: 'JE-2026-0103',
    date: '2026-09-12',
    time: '10:10 AM',
    customer: {
      name: 'Alok Agrawal',
      phone: '9907123456',
      address: 'Telibandha, Raipur',
    },
    items: [
      {
        id: 'item-4',
        productId: 'prod-5',
        name: 'boAt Airdopes 141 ANC TWS Earbuds',
        brand: 'boAt',
        category: 'Audio',
        hsn: '8518',
        quantity: 2,
        unit: 'Pcs',
        rate: 1270.34,
        discount: 0,
        taxableAmount: 2540.68,
        gstRate: 18,
        cgstAmount: 228.66,
        sgstAmount: 228.66,
        igstAmount: 0,
        total: 2998,
      },
    ],
    isInterState: false,
    taxableTotal: 2540.68,
    cgstTotal: 228.66,
    sgstTotal: 228.66,
    igstTotal: 0,
    totalGst: 457.32,
    discountType: 'flat',
    discountValue: 0,
    discountAmount: 0,
    roundOff: 0,
    grandTotal: 2998,
    grandTotalInWords: 'Rupees Two Thousand Nine Hundred Ninety-Eight Only',
    payment: {
      mode: 'Cash',
      amountReceived: 3000,
      cashAmount: 3000,
    },
    status: 'active',
    createdAt: '2026-09-12T10:10:00.000Z',
  },
];

export function getStoredSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_STORE_SETTINGS));
      return DEFAULT_STORE_SETTINGS;
    }
    return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to parse stored settings, using default', err);
    return DEFAULT_STORE_SETTINGS;
  }
}

export function saveStoredSettings(settings: StoreSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
  } catch (err) {
    console.error('Failed to load products from localStorage', err);
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to save products to localStorage', err);
  }
}

export function getStoredInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
      return INITIAL_INVOICES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_INVOICES;
  } catch (err) {
    console.error('Failed to load invoices from localStorage', err);
    return INITIAL_INVOICES;
  }
}

export function saveStoredInvoices(invoices: Invoice[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  } catch (err) {
    console.error('Failed to save invoices to localStorage', err);
  }
}

export function generateNextInvoiceNumber(settings: StoreSettings): {
  invoiceNumber: string;
  updatedSettings: StoreSettings;
} {
  const currentCount = settings.invoiceCounter || 100;
  const nextCount = currentCount + 1;
  const padded = String(nextCount).padStart(4, '0');
  const invoiceNumber = `${settings.invoicePrefix || 'JE-2026-'}${padded}`;

  const updatedSettings: StoreSettings = {
    ...settings,
    invoiceCounter: nextCount,
  };
  saveStoredSettings(updatedSettings);

  return { invoiceNumber, updatedSettings };
}

export interface BackupData {
  version: string;
  exportedAt: string;
  store: StoreSettings;
  products: Product[];
  invoices: Invoice[];
}

export function exportBackupData(): string {
  const backup: BackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    store: getStoredSettings(),
    products: getStoredProducts(),
    invoices: getStoredInvoices(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackupData(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.store || !Array.isArray(data.products) || !Array.isArray(data.invoices)) {
      return { success: false, message: 'Invalid backup file structure. Required keys missing.' };
    }
    saveStoredSettings(data.store);
    saveStoredProducts(data.products);
    saveStoredInvoices(data.invoices);
    return { success: true, message: `Successfully restored ${data.products.length} products and ${data.invoices.length} invoices!` };
  } catch (err) {
    return { success: false, message: `Failed to parse backup JSON: ${(err as Error).message}` };
  }
}

export function resetToFactoryDefaults(): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_STORE_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
}
