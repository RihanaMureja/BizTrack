export interface RevenueEntry {
  id: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  notes?: string;
}

export interface ExpenseEntry {
  id: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  receipt?: string;
  notes?: string;
}

export interface InventoryProduct {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  minStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface BusinessCustomer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  totalPurchases: number;
  creditBalance: number;
  status: 'Active' | 'Inactive';
}

export interface BusinessCashier {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  totalSales: number;
  joinedDate: string;
}
