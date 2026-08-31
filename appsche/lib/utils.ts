import { CATEGORY_COLORS } from '../types';

/**
 * Format date string YYYY-MM-DD to readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time HH:mm
 */
export function formatTime(time: string): string {
  return time;
}

/**
 * Get all dates in a specific month
 */
export function getDatesInMonth(year: number, month: number): string[] {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dates.push(dateStr);
  }

  return dates;
}

/**
 * Get color for category
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || '#888780';
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current time as HH:mm
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parse dateTime format YYYY-MM-DD#HH:mm
 */
export function parseDateTimeKey(dateTime: string): { date: string; time: string } {
  const [date, time] = dateTime.split('#');
  return { date, time };
}

/**
 * Create dateTime key from date and time
 */
export function createDateTimeKey(date: string, time: string): string {
  return `${date}#${time}`;
}

/**
 * Get day of week from date string
 */
export function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Get month name from month number (0-11)
 */
export function getMonthName(month: number): string {
  const date = new Date(2000, month, 1);
  return date.toLocaleDateString('en-US', { month: 'long' });
}
