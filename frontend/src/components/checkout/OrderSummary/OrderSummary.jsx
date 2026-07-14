import styles from './OrderSummary.module.css';

const OrderSummary = ({ total = 0, onProceed }) => {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Order Summery</h3>
      <div className={styles.divider} />
      <div className={styles.row}>
        <span className={styles.label}>Total</span>
        <span className={styles.value}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
      <button className={styles.proceedBtn} onClick={onProceed} type="button">
        Proceed to Check Out
      </button>
    </div>
  );
};

export default OrderSummary;
