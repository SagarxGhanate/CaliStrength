export function formatDateStandard(dateParam) {
  const d = dateParam ? new Date(dateParam) : new Date();
  if (isNaN(d.getTime())) return '';
  // Revert back to standard JS parseable format: 'May 03, 2026'
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function parseStoredDate(dateStr) {
  if (!dateStr) return new Date();
  
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
