export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  customer: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'Cash' | 'Chapa' | 'Bank Transfer';
  date: string;
  receiptId?: string;
}

export interface CashierCustomer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  totalPurchases: number;
  status: 'Active' | 'Inactive';
}

export interface Receipt {
  id: string;
  saleId: string;
  customer: string;
  items: SaleItem[];
  total: number;
  paymentMethod: string;
  date: string;
  cashier: string;
}

export interface ChapaPayment {
  id: string;
  customer: string;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  reference: string;
  date: string;
}
