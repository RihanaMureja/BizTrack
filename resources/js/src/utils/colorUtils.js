/**
 * Color utilities for status badges, avatars, and theme helpers.
 */

// Map status strings → Tailwind bg+text classes
export const statusColors = {
  Active:    'bg-green-100 text-green-700',
  Inactive:  'bg-gray-100 text-gray-600',
  Pending:   'bg-yellow-100 text-yellow-700',
  Paid:      'bg-green-100 text-green-700',
  Overdue:   'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-700',
  Low:       'bg-red-100 text-red-700',
  Medium:    'bg-yellow-100 text-yellow-700',
  Good:      'bg-green-100 text-green-700',
};

export function getStatusColor(status) {
  return statusColors[status] || 'bg-gray-100 text-gray-600';
}

// Deterministic avatar color from name string
const AVATAR_COLORS = [
  'bg-blue-500',  'bg-purple-500', 'bg-pink-500',
  'bg-indigo-500','bg-teal-500',   'bg-orange-500',
  'bg-green-600', 'bg-red-500',    'bg-cyan-500',
];

export function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

// Chart color palette
export const CHART_COLORS = [
  '#16a34a', '#2563eb', '#f59e0b', '#ef4444',
  '#8b5cf6', '#14b8a6', '#f97316', '#ec4899',
];
