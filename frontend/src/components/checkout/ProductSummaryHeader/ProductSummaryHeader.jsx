import styles from './ProductSummaryHeader.module.css';

const ProductSummaryHeader = ({ items = [], onBack }) => {
  const item = items[0];
  if (!item) return null;

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalOriginal = items.reduce((sum, i) => sum + (i.originalPrice || i.price) * i.quantity, 0);

  return (
    <div className={styles.header}>
      <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div className={styles.imageWrap}>
        <img src={item.image} alt={item.name} className={styles.image} />
      </div>

      <div className={styles.details}>
        <h3 className={styles.name}>{item.name}</h3>
        <div className={styles.badges}>
          <span className={styles.badge}>{item.size}</span>
          <span className={styles.badge}>{totalItems} item</span>
        </div>
      </div>

      <div className={styles.pricing}>
        {totalOriginal > totalPrice && (
          <span className={styles.originalPrice}>
            ₹{totalOriginal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        )}
        <span className={styles.salePrice}>
          ₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
};

export default ProductSummaryHeader;
