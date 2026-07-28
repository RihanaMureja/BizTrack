// ─── Roles ───────────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:    'admin',
  OWNER:    'owner',
  CASHIER:  'cashier',
  CUSTOMER: 'customer',
};

export const ROLE_LABELS = {
  admin:    'Super Admin',
  owner:    'Business Owner',
  cashier:  'Cashier',
  customer: 'Customer',
};

// ─── Statuses ─────────────────────────────────────────────────────────────────
export const STATUS = {
  ACTIVE:   'Active',
  INACTIVE: 'Inactive',
  PENDING:  'Pending',
  PAID:     'Paid',
  OVERDUE:  'Overdue',
  COMPLETED:'Completed',
  CANCELLED:'Cancelled',
};

// ─── Revenue categories ───────────────────────────────────────────────────────
export const REVENUE_CATEGORIES = [
  'Product Sales',
  'Service Fee',
  'Consulting',
  'Subscription',
  'Other Revenue',
];

// ─── Expense categories ───────────────────────────────────────────────────────
export const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Salaries',
  'Inventory Purchase',
  'Marketing',
  'Equipment',
  'Transport',
  'Maintenance',
  'Other',
];

// ─── Payment methods ──────────────────────────────────────────────────────────
export const PAYMENT_METHODS = ['Cash', 'Chapa', 'Bank Transfer', 'Credit'];

// ─── Subscription plans ───────────────────────────────────────────────────────
export const SUBSCRIPTION_PLANS = [
  { id: 'basic',      label: 'Basic',      price: 299,  period: 'month' },
  { id: 'standard',   label: 'Standard',   price: 599,  period: 'month' },
  { id: 'premium',    label: 'Premium',    price: 999,  period: 'month' },
  { id: 'enterprise', label: 'Enterprise', price: 1999, period: 'month' },
];

// ─── Date filter periods ──────────────────────────────────────────────────────
export const DATE_PERIODS = ['Today', 'This Week', 'This Month', 'This Year', 'Custom'];

// ─── Currency ─────────────────────────────────────────────────────────────────
export const CURRENCY = 'ETB';
export const CURRENCY_LOCALE = 'am-ET'; // Amharic (Ethiopia)

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ─── App name ─────────────────────────────────────────────────────────────────
export const APP_NAME = 'BizTrack';
