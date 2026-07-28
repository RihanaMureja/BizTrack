/**
 * Admin API endpoints.
 */
import client from './client';

export const adminApi = {
  // Dashboard
  getDashboard: () => client.get('/admin/dashboard'),

  // Business Owners
  getBusinessOwners:   (params) => client.get('/admin/business-owners', { params }),
  addBusinessOwner:    (data)   => client.post('/admin/business-owners', data),
  updateBusinessOwner: (id, d)  => client.put(`/admin/business-owners/${id}`, d),
  deleteBusinessOwner: (id)     => client.delete(`/admin/business-owners/${id}`),

  // Cashiers
  getCashiers:   (params) => client.get('/admin/cashiers', { params }),
  addCashier:    (data)   => client.post('/admin/cashiers', data),
  deleteCashier: (id)     => client.delete(`/admin/cashiers/${id}`),

  // Customers
  getCustomers: (params) => client.get('/admin/customers', { params }),

  // Subscriptions
  getSubscriptions:   () => client.get('/admin/subscriptions'),
  updateSubscription: (id, d) => client.put(`/admin/subscriptions/${id}`, d),

  // Chapa Transactions
  getChapaTransactions: (params) => client.get('/admin/chapa-transactions', { params }),

  // Reports & Analytics
  getReports: (params) => client.get('/admin/reports', { params }),

  // Notifications
  getNotifications:  () => client.get('/admin/notifications'),
  markNotificationRead: (id) => client.patch(`/admin/notifications/${id}/read`),

  // Activity Logs
  getActivityLogs: (params) => client.get('/admin/activity-logs', { params }),

  // System Settings
  getSettings:    () => client.get('/admin/settings'),
  updateSettings: (data) => client.put('/admin/settings', data),

  // Backup & Restore
  createBackup:  () => client.post('/admin/backup'),
  restoreBackup: (data) => client.post('/admin/restore', data),
  getBackups:    () => client.get('/admin/backups'),
};

export default adminApi;
