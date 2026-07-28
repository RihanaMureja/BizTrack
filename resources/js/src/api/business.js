/**
 * Business Owner API endpoints.
 * All functions return axios-style { data } objects.
 * Swap mock data for real client calls when backend is ready.
 */
import client from './client';

export const businessApi = {
  // Dashboard
  getDashboard: () => client.get('/business/dashboard'),

  // Revenue
  getRevenue:     (params) => client.get('/business/revenue', { params }),
  addRevenue:     (data)   => client.post('/business/revenue', data),
  updateRevenue:  (id, data) => client.put(`/business/revenue/${id}`, data),
  deleteRevenue:  (id)     => client.delete(`/business/revenue/${id}`),

  // Expenses
  getExpenses:    (params) => client.get('/business/expenses', { params }),
  addExpense:     (data)   => client.post('/business/expenses', data),
  updateExpense:  (id, data) => client.put(`/business/expenses/${id}`, data),
  deleteExpense:  (id)     => client.delete(`/business/expenses/${id}`),

  // Inventory
  getInventory:   (params) => client.get('/business/inventory', { params }),
  addProduct:     (data)   => client.post('/business/inventory', data),
  updateProduct:  (id, data) => client.put(`/business/inventory/${id}`, data),
  deleteProduct:  (id)     => client.delete(`/business/inventory/${id}`),

  // Reports
  getReports: (params) => client.get('/business/reports', { params }),

  // Cashiers
  getCashiers:   () => client.get('/business/cashiers'),
  addCashier:    (data) => client.post('/business/cashiers', data),
  updateCashier: (id, data) => client.put(`/business/cashiers/${id}`, data),
  deleteCashier: (id) => client.delete(`/business/cashiers/${id}`),

  // Notifications
  getNotifications: () => client.get('/business/notifications'),
};

export default businessApi;
