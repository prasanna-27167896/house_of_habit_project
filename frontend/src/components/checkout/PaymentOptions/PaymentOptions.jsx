import styles from './PaymentOptions.module.css';

const PaymentOptions = ({ totalPrice = 0, codCharge = 90, onSelectPayment }) => {
  const codTotal = totalPrice + codCharge;

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Payment Option</h3>

      {/* UPI Payment */}
      <button
        className={styles.paymentCard}
        onClick={() => onSelectPayment?.('upi')}
        type="button"
      >
        <div className={styles.cardLeft}>
          <span className={styles.payIcon}>⚡</span>
          <span className={styles.payLabel}>UPI Payment</span>
        </div>
        <div className={styles.cardRight}>
          <span className={styles.payAmount}>
            ₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </button>

      {/* Cash on Delivery */}
      <div className={styles.codWrapper}>
        <span className={styles.codBadge}>₹{codCharge} rs COD Charge Added</span>
        <button
          className={styles.paymentCard}
          onClick={() => onSelectPayment?.('cod')}
          type="button"
        >
          <div className={styles.cardLeft}>
            <span className={styles.payIcon}>💳</span>
            <span className={styles.payLabel}>Cash on Delivery</span>
          </div>
          <div className={styles.cardRight}>
            <span className={styles.payAmount}>
              ₹{codTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </button>
      </div>

      {/* Debit/Credit Card */}
      <button
        className={styles.paymentCard}
        onClick={() => onSelectPayment?.('card')}
        type="button"
      >
        <div className={styles.cardLeft}>
          <span className={styles.payIcon}>💳</span>
          <span className={styles.payLabel}>Debit / Credit Card</span>
        </div>
        <div className={styles.cardRight}>
          <span className={styles.payAmount}>
            ₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </button>
    </div>
  );
};

export default PaymentOptions;
