import styles from './DeliveryCard.module.css';

const DeliveryCard = ({ address, onChangeAddress }) => {
  return (
    <div className={styles.wrapper}>
      {/* ── Delivery address ── */}
      <div className={styles.addressSection}>
        <div className={styles.addressHeader}>
          <div className={styles.addressLeft}>
            <span className={styles.pinIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff5f15" stroke="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
              </svg>
            </span>
            <h4 className={styles.deliveryTo}>Delivery to {address.name}</h4>
          </div>
          <button className={styles.changeBtn} onClick={onChangeAddress} type="button">
            Change
          </button>
        </div>

        <p className={styles.addressText}>
          {address.addressLine1}
          <br />
          {address.addressLine2}
        </p>

        <div className={styles.contactRow}>
          <span className={styles.contactItem}>{address.phone}</span>
          <span className={styles.contactDivider}>|</span>
          <span className={styles.contactItem}>{address.email}</span>
        </div>
      </div>

      {/* ── Shipping ── */}
      <div className={styles.shippingSection}>
        <span className={styles.shippingIcon}>🚚</span>
        <span className={styles.shippingLabel}>Shipping</span>
        <span className={styles.freeBadge}>Free</span>
      </div>
    </div>
  );
};

export default DeliveryCard;
