
export interface Product {
  id: string;
  barcode?: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  imageUrl: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
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
    type: 'DEBT' | 'REPAYMENT';
    note?: string;
    saleId?: string;
}

export interface StoreSettings {
    name: string;
    address: string;
    phone: string;
    vatNumber?: string;
    taxRate: number;
    footerText?: string;
    autoPrint: boolean;
}

export enum PaymentType {
  CASH = 'نقدي',
  CARD = 'بطاقة',
  CREDIT = 'آجل',
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  totalAmount: number;
  paymentType: PaymentType;
  date: string;
  customerId?: string;
}

export type Screen = 'sales' | 'inventory' | 'reports' | 'suppliers' | 'debt' | 'settings';
