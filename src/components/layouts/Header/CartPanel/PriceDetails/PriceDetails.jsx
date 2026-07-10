import styles from './PriceDetails.module.css';

const PriceDetails = ({ items, onPayment }) => {
  // Calculate totals
  const bagTotal = items.reduce((sum, item) => sum + item.price, 0);
  const originalTotal = items.reduce((sum, item) => sum + (item.originalPrice || item.price), 0);
  const discount = originalTotal - bagTotal;
  const shippingCharge = 55; // Fixed shipping charge
  const grandTotal = bagTotal + shippingCharge;

  return (
    <>
      <div className={styles.priceDetails}>
        <h3 className={styles.title}>Price Details</h3>

        <div className={styles.row}>
          <span className={styles.label}>Bag Total</span>
          <span className={styles.value}>₹{bagTotal}</span>
        </div>

        {discount > 0 && (
          <div className={styles.row}>
            <span className={styles.label}>Product Discount</span>
            <span className={`${styles.value} ${styles.discount}`}>-₹{discount}</span>
          </div>
        )}

        <div className={styles.row}>
          <span className={styles.label}>Shipping Charge</span>
          <span className={styles.value}>₹{shippingCharge}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.grandTotalLabel}>Grand Total</span>
          <span className={styles.grandTotal}>₹{grandTotal}</span>
        </div>
      </div>
      <button className={styles.payButton} onClick={onPayment}>
        Pay ₹{grandTotal}
      </button>
    </>
  );
};

export default PriceDetails;
