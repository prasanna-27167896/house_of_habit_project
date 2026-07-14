import { useState } from 'react';
import styles from './CouponSection.module.css';

const CouponSection = ({ variant = 'drawer', availableCount = 9 }) => {
  const [couponCode, setCouponCode] = useState('');

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputRow}>
        <span className={styles.couponIcon}>🏷️</span>
        <input
          type="text"
          className={styles.input}
          placeholder="Enter Coupon Code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
      </div>

      {variant === 'drawer' ? (
        <button className={styles.viewAllLink} type="button">
          View All Offer
          <span className={styles.arrow}>→</span>
        </button>
      ) : (
        <div className={styles.availableRow}>
          <span className={styles.availableText}>
            <span className={styles.couponIcon}>🏷️</span>
            {availableCount} coupons available
          </span>
          <button className={styles.viewAllBtn} type="button">
            View all
          </button>
        </div>
      )}
    </div>
  );
};

export default CouponSection;
