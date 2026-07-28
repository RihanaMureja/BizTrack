import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const MOCK_USERS = [
  { id: 1, name: 'Super Admin',    email: 'admin@biztrack.com',  password: 'admin123',    role: 'super_admin', avatar: 'SA' },
  { id: 2, name: 'Abebe Kebede',   email: 'owner@biztrack.com',   password: 'owner123',    role: 'owner',       avatar: 'AK' },
  { id: 3, name: 'Sara Alemu',     email: 'cashier@biztrack.com', password: 'cashier123',  role: 'cashier',     avatar: 'SA' },
  { id: 4, name: 'Abebe Bekele',   email: 'customer@biztrack.com',password: 'customer123', role: 'customer',    avatar: 'AB' },
];

// ✅ CORRECT ROLE PATHS
const ROLE_PATHS = {
  super_admin: '/admin',
  admin: '/admin',
  owner: '/owner/dashboard',
  cashier: '/cashier/dashboard',
  customer: '/customer/dashboard',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('biztrack_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, error: 'Invalid email or password' };
    
    const { password: _, ...safe } = found;
    localStorage.setItem('biztrack_user', JSON.stringify(safe));
    setUser(safe);
    setIsAuthenticated(true);
    return { success: true, user: safe, redirectTo: ROLE_PATHS[safe.role] };
  };

  const register = async (data) => {
    // Mock registration - creates a new customer account
    const newUser = {
      id: Date.now(),
      name: data.name || 'New User',
      email: data.email,
      password: data.password,
      role: 'customer',  // ✅ New users are CUSTOMERS by default
      avatar: data.name?.charAt(0) || 'NU',
    };
    
    // In production, this would call an API
    localStorage.setItem('biztrack_user', JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthenticated(true);
    return { success: true, user: newUser, redirectTo: '/customer/dashboard' };
  };

  const logout = () => {
    localStorage.removeItem('biztrack_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const getRoleHome = () => ROLE_PATHS[user?.role] || '/login';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, getRoleHome }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;