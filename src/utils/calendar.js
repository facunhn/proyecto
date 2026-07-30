export function downloadPromoReminder(promo) {
  if (!promo.expiresAt) return;
  const date = promo.expiresAt.replace(/-/g, '');
  const escapeText = (text) => (text || '').replace(/[\n\r]/g, ' ');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:ahorrix-${promo.id}@ahorrix.app`,
    `DTSTART;VALUE=DATE:${date}`,
    `DTEND;VALUE=DATE:${date}`,
    `SUMMARY:Vence: ${escapeText(promo.business)} (${escapeText(promo.discountLabel)})`,
    `DESCRIPTION:${escapeText(promo.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${promo.business}-vencimiento.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
