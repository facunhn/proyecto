import { HeartIcon } from './icons';

export default function PromoCard({ promo, onOpen, onToggleFav }) {
  const badgeLabel = promo.isBank ? 'BANCARIA' : promo.category.toUpperCase();

  return (
    <div className="promo-card" role="button" tabIndex={0} onClick={() => onOpen(promo.id)} onKeyDown={(e) => e.key === 'Enter' && onOpen(promo.id)}>
      <div className="promo-card-image">
        <div className="promo-card-image-label">{promo.imageLabel}</div>
        <button type="button" className="btn btn-icon btn-secondary fav-toggle" onClick={(e) => onToggleFav(promo.id, e)} aria-label="Guardar promoción">
          <HeartIcon filled={promo.isFav} size={15} style={{ color: promo.isFav ? 'var(--color-accent)' : 'var(--color-text)' }} />
        </button>
        <div className={`promo-badge${promo.isBank ? ' is-bank' : ''}`}>{badgeLabel}</div>
      </div>
      <div className="card-title-row">
        <div className="card-title">{promo.business}</div>
        <div className="card-discount">{promo.discountLabel}</div>
      </div>
      <div className="card-description">{promo.description}</div>
      <div className="card-meta">
        <span>
          {promo.category} · {promo.distance}
        </span>
        <span>Vence {promo.expiry}</span>
      </div>
    </div>
  );
}
