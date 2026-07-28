/**
 * Cashier API endpoints. (Credit service removed)
 */
import client from './client';

export const cashierApi = {
  // Dashboard
  getDashboard: () => client.get('/cashier/dashboard'),

  // Sales
  getSales:   (params) => client.get('/cashier/sales', { params }),
  addSale:    (data)   => client.post('/cashier/sales', data),
  getSaleById:(id)     => client.get(`/cashier/sales/${id}`),

  // Customers
  getCustomers:   (params) => client.get('/cashier/customers', { params }),
  addCustomer:    (data)   => client.post('/cashier/customers', data),
  updateCustomer: (id, d)  => client.put(`/cashier/customers/${id}`, d),

  // Chapa Payments
  getChapaPayments: (params) => client.get('/cashier/chapa-payments', { params }),
  sendChapaLink:    (data)   => client.post('/cashier/chapa-payments/send-link', data),

  // Receipts
  getReceipts:    (params) => client.get('/cashier/receipts', { params }),
  getReceiptById: (id)     => client.get(`/cashier/receipts/${id}`),

  // Notifications
  getNotifications: () => client.get('/cashier/notifications'),
  markRead: (id) => client.patch(`/cashier/notifications/${id}/read`),
};

export default cashierApi;
