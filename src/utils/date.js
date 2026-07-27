export function formatShortDate(isoDate) {
  if (!isoDate) return '';
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function isPastDate(isoDate) {
  if (!isoDate) return false;
  return isoDate < todayIso();
}
