import styles from './OrderConfirmation.module.css';
import SuccessGif from '../../../assets/images/order-confirmation-success.gif';

const OrderConfirmation = ({ onContinueShopping, onTrackOrder, totalPrice = 999 }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.body} data-lenis-prevent>
        {/* Success Illustration Block */}
        <div className={styles.successBlock}>
          <img src={SuccessGif} alt="Order Successful" className={styles.successGif} />
          
          <h3 className={styles.title}>Your Order Is On Its Way</h3>
          <p className={styles.message}>
            Payment successful. Your invoice and shipping updates will be sent to your email shortly.
          </p>
        </div>

        <div className={styles.divider}></div>

        {/* Order Details Table */}
        <div className={styles.detailsTable}>
          <div className={styles.row}>
            <span className={styles.label}>Order Number</span>
            <span className={styles.value}>ORD987654</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Payment Time</span>
            <span className={styles.value}>25-07-2024, 13:22:16</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Payment Method</span>
            <span className={styles.value}>Google Pay</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Order Date</span>
            <span className={styles.value}>01 June 2026</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Estimated Delivery</span>
            <span className={styles.value}>05-07 June 2026</span>
          </div>

          <div className={styles.dottedDivider}></div>

          <div className={`${styles.row} ${styles.amountRow}`}>
            <span className={styles.amountLabel}>Amount</span>
            <span className={styles.amountValue}>
              ₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Appreciate Note */}
        <p className={styles.appreciateNote}>We appreciate your visit, see yo again!</p>
      </div>

      {/* Action Buttons Row */}
      <div className={styles.footerRow}>
        <button className={styles.trackBtn} onClick={onTrackOrder} type="button">
          Track Order
        </button>
        <button className={styles.continueBtn} onClick={onContinueShopping} type="button">
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
