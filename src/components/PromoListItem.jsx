export default function PromoListItem({ promo, onOpen, dark, expiryPrefix }) {
  return (
    <div
      className={`promo-list-item${dark ? ' promo-list-item--dark' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(promo.id)}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(promo.id)}
    >
      <div className="promo-list-thumb">
        {promo.imageUrl ? (
          <img src={promo.imageUrl} alt={promo.business} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
        ) : (
          <div className="promo-list-thumb-label">LOGO</div>
        )}
      </div>
      <div className="promo-list-body">
        <div className="promo-list-row">
          <div className="promo-list-title">{promo.business}</div>
          <div className={`promo-list-discount${dark ? ' promo-list-discount--dark' : ''}`}>{promo.discountLabel}</div>
        </div>
        <div className={`promo-list-meta${dark ? ' promo-list-meta--dark' : ''}`}>
          {expiryPrefix ? `${expiryPrefix} ${promo.expiry}` : `${promo.category} · ${promo.distance}`}
        </div>
      </div>
    </div>
  );
}
