
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

export enum PaymentType {
  CASH = 'نقدي',
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
}
