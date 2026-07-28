/**
 * Auth API — Login, Register, Logout, Forgot/Reset Password
 * Replace mock implementations with real client calls when backend is ready.
 */
import client from './client';

export const authApi = {
  login: async ({ email, password }) => {
    // MOCK — replace with: return client.post('/auth/login', { email, password });
    const MOCK_USERS = [
      { id: 1, name: 'Super Admin',   email: 'admin@biztrack.com',  password: 'admin123',    role: 'admin',    token: 'mock-admin-token'    },
      { id: 2, name: 'Abebe Tadesse', email: 'abebe@habesha.com',   password: 'owner123',    role: 'owner',    token: 'mock-owner-token'    },
      { id: 3, name: 'Sara Alemu',    email: 'sara@cashier.com',    password: 'cashier123',  role: 'cashier',  token: 'mock-cashier-token'  },
      { id: 4, name: 'Abebe Bekele',  email: 'abebe@acme.com',      password: 'customer123', role: 'customer', token: 'mock-customer-token' },
    ];
    await new Promise(r => setTimeout(r, 500));
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const { password: _, ...safe } = user;
    return { data: safe };
  },

  register: async (payload) => {
    // MOCK — replace with: return client.post('/auth/register', payload);
    await new Promise(r => setTimeout(r, 800));
    return { data: { message: 'Registration successful. Please sign in.' } };
  },

  forgotPassword: async ({ email }) => {
    // replace with: return client.post('/auth/forgot-password', { email });
    await new Promise(r => setTimeout(r, 700));
    return { data: { message: 'Reset link sent to ' + email } };
  },

  resetPassword: async ({ token, password }) => {
    // replace with: return client.post('/auth/reset-password', { token, password });
    await new Promise(r => setTimeout(r, 700));
    return { data: { message: 'Password reset successfully' } };
  },

  logout: async () => {
    // replace with: return client.post('/auth/logout');
    return { data: { message: 'Logged out' } };
  },
};

export default authApi;
