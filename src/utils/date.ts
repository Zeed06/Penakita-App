// src/utils/date.ts
// Date formatting utility

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

/**
 * Format ISO date string to "12 Jan 2025" format (Indonesian months).
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const day = date.getDate();
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return '';
  }
}
