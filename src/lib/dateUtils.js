import { addDays, subDays, differenceInDays, format, parseISO, isValid } from 'date-fns';

export function computeBuyDates(eventDateStr) {
  const eventDate = parseISO(eventDateStr);
  return {
    buy_online_by: format(subDays(eventDate, 28), 'yyyy-MM-dd'),
    buy_local_by: format(subDays(eventDate, 14), 'yyyy-MM-dd'),
    wrap_by: format(subDays(eventDate, 3), 'yyyy-MM-dd'),
  };
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = parseISO(dateStr);
  if (!isValid(d)) return null;
  return differenceInDays(d, new Date());
}

export function formatEventDate(dateStr) {
  if (!dateStr) return '';
  const d = parseISO(dateStr);
  if (!isValid(d)) return dateStr;
  return format(d, 'MMM d, yyyy');
}

export function urgencyLabel(daysAway) {
  if (daysAway === null) return '';
  if (daysAway < 0) return 'past';
  if (daysAway === 0) return 'today';
  if (daysAway <= 3) return `${daysAway}d away`;
  if (daysAway <= 7) return `${daysAway}d away`;
  if (daysAway <= 30) return `${daysAway}d away`;
  return format(parseISO(`${new Date().getFullYear()}-01-01`), 'MMM d');
}

export function urgencyColor(daysAway) {
  if (daysAway === null) return 'text-ink-soft';
  if (daysAway < 0) return 'text-ink-soft line-through';
  if (daysAway <= 3) return 'text-terracotta font-semibold';
  if (daysAway <= 7) return 'text-terracotta';
  if (daysAway <= 14) return 'text-butter-dark';
  return 'text-ink-soft';
}

export function getUpcomingEvents(events, days = 30) {
  const now = new Date();
  const cutoff = addDays(now, days);
  return events
    .filter(e => {
      const d = parseISO(e.event_date);
      return isValid(d) && d >= now && d <= cutoff;
    })
    .sort((a, b) => parseISO(a.event_date) - parseISO(b.event_date));
}