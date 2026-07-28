/**
 * Customer API endpoints.
 */
import client from './client';

export const customerApi = {
  // Dashboard
  getDashboard: () => client.get('/customer/dashboard'),

  // Purchases
  getPurchases:    (params) => client.get('/customer/purchases', { params }),
  getPurchaseById: (id)     => client.get(`/customer/purchases/${id}`),

  // Invoices
  getInvoices:    (params) => client.get('/customer/invoices', { params }),
  getInvoiceById: (id)     => client.get(`/customer/invoices/${id}`),
  downloadInvoice:(id)     => client.get(`/customer/invoices/${id}/download`, { responseType: 'blob' }),

  // Chapa Payments
  getChapaPayments:  (params) => client.get('/customer/chapa-payments', { params }),
  initiateChapaPayment: (data) => client.post('/customer/chapa-payments/initiate', data),
  verifyPayment:     (ref)   => client.get(`/customer/chapa-payments/verify/${ref}`),

  // Payment History
  getPaymentHistory: (params) => client.get('/customer/payment-history', { params }),

  // Notifications
  getNotifications: () => client.get('/customer/notifications'),
  markRead: (id) => client.patch(`/customer/notifications/${id}/read`),
};

export default customerApi;
