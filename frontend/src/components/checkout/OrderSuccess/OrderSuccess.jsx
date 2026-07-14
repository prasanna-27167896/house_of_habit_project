import { useNavigate } from 'react-router-dom';
import styles from './OrderSuccess.module.css';

const OrderSuccess = ({ order }) => {
  const navigate = useNavigate();

  const details = [
    { label: 'Order Number', value: order.orderNumber },
    { label: 'Payment Time', value: order.paymentTime },
    { label: 'Payment Method', value: order.paymentMethod },
    { label: 'Order Date', value: order.orderDate },
    { label: 'Estimated Delivery', value: order.estimatedDelivery },
  ];

  return (
    <div className={styles.wrapper}>
      {/* ── Success Icon ── */}
      <div className={styles.iconWrap}>
        <div className={styles.confetti} />
        <div className={styles.checkIcon}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      {/* ── Heading ── */}
      <h2 className={styles.heading}>Your Order Is On Its Way</h2>
      <p className={styles.subText}>
        Payment successful. Your invoice and shipping updates
        will be sent to your email shortly.
      </p>

      {/* ── Details Table ── */}
      <div className={styles.detailsCard}>
        {details.map((d) => (
          <div className={styles.detailRow} key={d.label}>
            <span className={styles.detailLabel}>{d.label}</span>
            <span className={styles.detailValue}>{d.value}</span>
          </div>
        ))}

        <div className={styles.dashedDivider} />

        <div className={styles.detailRow}>
          <span className={styles.amountLabel}>Amount</span>
          <span className={styles.amountValue}>
            ₹{order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* ── Message ── */}
      <p className={styles.appreciation}>
        We appreciate your visit, see yo again!
      </p>

      {/* ── Actions ── */}
      <div className={styles.actions}>
        <button
          className={styles.trackBtn}
          onClick={() => navigate('/account')}
          type="button"
        >
          Track Order
        </button>
        <button
          className={styles.shopBtn}
          onClick={() => navigate('/')}
          type="button"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
