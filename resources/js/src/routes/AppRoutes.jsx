import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';

// ===== ADMIN PAGES =====
import AdminDashboard from '../pages/admin/AdminDashboard';
import BusinessOwners from '../pages/admin/BusinessOwners';
import Cashiers from '../pages/admin/Cashiers';
import Customers from '../pages/admin/Customers';
import Subscriptions from '../pages/admin/Subscriptions';
import ChapaTransactions from '../pages/admin/ChapaTransactions';
import ReportsAnalytics from '../pages/admin/ReportsAnalytics';
import ActivityLogs from '../pages/admin/ActivityLogs';
import AdminNotifications from '../pages/admin/Notifications';
import BackupRestore from '../pages/admin/BackupRestore';
import SystemSettings from '../pages/admin/SystemSettings';
import AdminProfile from '../pages/admin/AdminProfile';
import ELearning from '../pages/admin/ELearning';

// ===== AUTH PAGES =====
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// ===== BUSINESS OWNER PAGES =====
import BusinessDashboard from '../pages/business/BusinessDashboard';
import Revenue from '../pages/business/Revenue';
import Expenses from '../pages/business/Expenses';
import Inventory from '../pages/business/Inventory';
import CashierMng from '../pages/business/CashierMng';
import BusinessCustomers from '../pages/business/Customers';
import Reports from '../pages/business/Reports';
import BusinessProfile from '../pages/business/BusinessProfile';
import BusinessNotifications from '../pages/business/Notifications';

// ===== CASHIER PAGES =====
import CashierDashboard from '../pages/cashier/Dashboard';
import CashierCustomers from '../pages/cashier/Customers';
import CashierSales from '../pages/cashier/Sales';
import CashierCredit from '../pages/cashier/Credit';
import CashierChapa from '../pages/cashier/ChapaPayments';
import CashierReceipts from '../pages/cashier/Receipts';
import CashierNotifications from '../pages/cashier/Notifications';
import CashierProfile from '../pages/cashier/Profile';

// ===== CUSTOMER PAGES =====
import CustomerDashboard from '../pages/customer/CustomerDashboard';

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ===== PUBLIC ROUTES ===== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ===== ADMIN ROUTES ===== */}
      <Route path="/admin" element={<PrivateRoute roles={['super_admin', 'admin']}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/elearning" element={<PrivateRoute roles={['super_admin', 'admin']}><ELearning /></PrivateRoute>} />
      <Route path="/admin/business-owners" element={<PrivateRoute roles={['super_admin', 'admin']}><BusinessOwners /></PrivateRoute>} />
      <Route path="/admin/cashiers" element={<PrivateRoute roles={['super_admin', 'admin']}><Cashiers /></PrivateRoute>} />
      <Route path="/admin/customers" element={<PrivateRoute roles={['super_admin', 'admin']}><Customers /></PrivateRoute>} />
      <Route path="/admin/subscriptions" element={<PrivateRoute roles={['super_admin', 'admin']}><Subscriptions /></PrivateRoute>} />
      <Route path="/admin/chapa-transactions" element={<PrivateRoute roles={['super_admin', 'admin']}><ChapaTransactions /></PrivateRoute>} />
      <Route path="/admin/reports" element={<PrivateRoute roles={['super_admin', 'admin']}><ReportsAnalytics /></PrivateRoute>} />
      <Route path="/admin/notifications" element={<PrivateRoute roles={['super_admin', 'admin']}><AdminNotifications /></PrivateRoute>} />
      <Route path="/admin/activity-logs" element={<PrivateRoute roles={['super_admin', 'admin']}><ActivityLogs /></PrivateRoute>} />
      <Route path="/admin/backup-restore" element={<PrivateRoute roles={['super_admin', 'admin']}><BackupRestore /></PrivateRoute>} />
      <Route path="/admin/settings" element={<PrivateRoute roles={['super_admin', 'admin']}><SystemSettings /></PrivateRoute>} />
      <Route path="/admin/profile" element={<PrivateRoute roles={['super_admin', 'admin']}><AdminProfile /></PrivateRoute>} />

      {/* ===== BUSINESS OWNER ROUTES ===== */}
      <Route path="/owner/dashboard" element={<PrivateRoute roles={['owner']}><BusinessDashboard /></PrivateRoute>} />
      <Route path="/owner/revenue" element={<PrivateRoute roles={['owner']}><Revenue /></PrivateRoute>} />
      <Route path="/owner/expenses" element={<PrivateRoute roles={['owner']}><Expenses /></PrivateRoute>} />
      <Route path="/owner/inventory" element={<PrivateRoute roles={['owner']}><Inventory /></PrivateRoute>} />
      <Route path="/owner/cashiers" element={<PrivateRoute roles={['owner']}><CashierMng /></PrivateRoute>} />
      <Route path="/owner/customers" element={<PrivateRoute roles={['owner']}><BusinessCustomers /></PrivateRoute>} />
      <Route path="/owner/reports" element={<PrivateRoute roles={['owner']}><Reports /></PrivateRoute>} />
      <Route path="/owner/profile" element={<PrivateRoute roles={['owner']}><BusinessProfile /></PrivateRoute>} />
      <Route path="/owner/notifications" element={<PrivateRoute roles={['owner']}><BusinessNotifications /></PrivateRoute>} />

      {/* ===== CASHIER ROUTES ===== */}
      <Route path="/cashier/dashboard" element={<PrivateRoute roles={['cashier']}><CashierDashboard /></PrivateRoute>} />
      <Route path="/cashier/sales" element={<PrivateRoute roles={['cashier']}><CashierSales /></PrivateRoute>} />
      <Route path="/cashier/customers" element={<PrivateRoute roles={['cashier']}><CashierCustomers /></PrivateRoute>} />
      <Route path="/cashier/credit" element={<PrivateRoute roles={['cashier']}><CashierCredit /></PrivateRoute>} />
      <Route path="/cashier/chapa" element={<PrivateRoute roles={['cashier']}><CashierChapa /></PrivateRoute>} />
      <Route path="/cashier/receipts" element={<PrivateRoute roles={['cashier']}><CashierReceipts /></PrivateRoute>} />
      <Route path="/cashier/notifications" element={<PrivateRoute roles={['cashier']}><CashierNotifications /></PrivateRoute>} />
      <Route path="/cashier/profile" element={<PrivateRoute roles={['cashier']}><CashierProfile /></PrivateRoute>} />

      {/* ===== CUSTOMER ROUTES ===== */}
      <Route path="/customer/dashboard" element={<PrivateRoute roles={['customer']}><CustomerDashboard /></PrivateRoute>} />

      {/* ===== FALLBACK ===== */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;