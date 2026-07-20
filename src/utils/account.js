export function accountInitials(session, accountType) {
  if (session?.name?.trim()) {
    const parts = session.name.trim().split(/\s+/).slice(0, 2);
    const initials = parts.map((p) => p[0]?.toUpperCase()).join('');
    if (initials) return initials;
  }
  return accountType === 'negocio' ? 'NG' : 'JP';
}

export function profileName(session, accountType) {
  if (session?.name?.trim()) return session.name.trim();
  return accountType === 'negocio' ? 'Mi negocio' : 'Juana Pérez';
}
