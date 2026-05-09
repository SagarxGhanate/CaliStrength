export function formatDateStandard(dateParam) {
  const d = dateParam ? new Date(dateParam) : new Date();
  if (isNaN(d.getTime())) return '';
  // Revert back to standard JS parseable format: 'May 03, 2026'
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function parseStoredDate(dateStr) {
  if (!dateStr) return new Date();
  
  // Handle YYYY-MM-DD format explicitly to avoid UTC midnight shift.
  // new Date("2026-05-07") parses as UTC midnight, which in IST/EST etc.
  // shifts to the previous day. Instead, split and use local Date constructor.
  const isoMatch = String(dateStr).match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]))
  }
  
  // Try normal parse
  let d = new Date(dateStr);
  
  // Handle edge cases where "5 May" is parsed as year 2001 by some engines
  if (!isNaN(d.getTime()) && d.getFullYear() === 2001) {
    const currentYear = new Date().getFullYear();
    const d2 = new Date(`${dateStr} ${currentYear}`);
    if (!isNaN(d2.getTime())) return d2;
  }
  
  // Handle fully invalid parsing
  if (isNaN(d.getTime())) {
    const currentYear = new Date().getFullYear();
    const d2 = new Date(`${dateStr} ${currentYear}`);
    return isNaN(d2.getTime()) ? new Date() : d2;
  }
  
  return d;
}

/**
 * Convert a date to "YYYY-MM-DD" string in local timezone.
 * Use this for all date comparisons to avoid format mismatches.
 */
export function toLocalDateStr(dateParam) {
  const d = dateParam instanceof Date ? dateParam : parseStoredDate(dateParam)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

