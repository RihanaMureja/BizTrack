export function getStoredUser() {
  try {
    const raw = localStorage.getItem('biztrack_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  return localStorage.getItem('biztrack_token') || null;
}

export function logout() {
  localStorage.removeItem('biztrack_user');
  localStorage.removeItem('biztrack_token');
}

export function isAuthenticated() {
  return !!getStoredUser();
}

export function hasRole(role) {
  const user = getStoredUser();
  return user?.role === role;
}