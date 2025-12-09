
export interface Product {
  id: string; // Can be barcode
  name: string;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  supplierId?: string;
  imageUrl: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    totalDebt: number;
    transactions: DebtTransaction[];
}

export interface DebtTransaction {
    id: string;
    date: string;
    amount: number;
    type: 'DEBT' | 'REPAYMENT'; // دين جديد أو سداد
    note?: string;
    saleId?: string;
}

export interface StoreSettings {
    name: string;
    address: string;
    phone: string;
    vatNumber?: string;
    taxRate: number; // Percentage (e.g., 15)
    footerText?: string;
}

export enum PaymentType {
  CASH = 'نقدي',
  CARD = 'بطاقة',
  CREDIT = 'آجل',
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number; // Price at the time of sale
}

export interface Sale {
  id: string;
  items: CartItem[];
  totalAmount: number;
  paymentType: PaymentType;
  date: string; // ISO 8601 format
  discount?: number;
  customerId?: string; // If sale is credit
}

export type Screen = 'sales' | 'inventory' | 'reports' | 'suppliers' | 'debt' | 'settings';