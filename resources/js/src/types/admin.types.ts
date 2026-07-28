export interface BusinessOwner {
  id: number;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  plan: 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
  status: 'Active' | 'Inactive';
  joinedDate: string;
  revenue?: number;
}

export interface Subscription {
  id: number;
  businessName: string;
  plan: string;
  price: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Cancelled';
}

export interface ChapaTransaction {
  id: string;
  business: string;
  amount: number;
  fee: number;
  net: number;
  status: 'Success' | 'Pending' | 'Failed';
  date: string;
  reference: string;
}

export interface ActivityLog {
  id: number;
  user: string;
  role: string;
  action: string;
  detail: string;
  ip: string;
  timestamp: string;
}

export interface SystemSettings {
  businessName: string;
  currency: string;
  language: string;
  timezone: string;
  chapaPublicKey: string;
  chapaSecretKey: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}
