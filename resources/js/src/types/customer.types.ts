export interface Invoice {
  id: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CustomerPayment {
  id: string;
  invoice: string;
  method: 'Cash' | 'Chapa' | 'Bank Transfer';
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface CustomerNotification {
  id: number;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  time: Date | string;
  read: boolean;
}
