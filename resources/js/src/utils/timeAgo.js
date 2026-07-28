/**
 * Returns a human-readable relative time string.
 * Examples: "just now", "8 min ago", "1 hr ago", "2 days ago", "Mar 5"
 *
 * Usage: timeAgo(new Date('2025-07-20T10:30:00'))
 */
export function timeAgo(date) {
  const now  = new Date();
  const then = date instanceof Date ? date : new Date(date);
  const diff = Math.floor((now - then) / 1000); // seconds

  if (diff < 60)           return 'just now';
  if (diff < 3600)         return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)        return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 86400 * 7)    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) === 1 ? '' : 's'} ago`;
  if (diff < 86400 * 30)   return `${Math.floor(diff / 86400 / 7)} week${Math.floor(diff / 86400 / 7) === 1 ? '' : 's'} ago`;
  if (diff < 86400 * 365)  return `${Math.floor(diff / 86400 / 30)} month${Math.floor(diff / 86400 / 30) === 1 ? '' : 's'} ago`;

  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default timeAgo;
