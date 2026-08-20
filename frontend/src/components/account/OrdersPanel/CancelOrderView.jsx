import { useState } from 'react';
import styles from '../../../pages/Account/CancelOrderPage.module.css';
import { mockOrders } from '../../../data/ordersData';

/* ── Inline SVG Icons ── */
const EligibleIcon = () => (
  <svg width='22' height='22' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='12' cy='12' r='10' fill='#16a34a' />
    <path d='M8.5 12L10.5 14L15.5 9' stroke='#FFFFFF' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
);

const CANCELLATION_REASONS = [
  'Delayed Delivery Cancellation',
  'Incorrect size ordered',
  'Duplicate Order',
  'Cash Issue',
  'Ordered by mistake',
  'Wants to change style/color',
];

const CancelOrderView = ({ orderId, onBack }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');

  const order = mockOrders.find((o) => o.id === Number(orderId));

  if (!order) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.notFound}>Order not found.</p>
      </div>
    );
  }

  const { product } = order;

  return (
    <div className={styles.wrapper}>
      {/* ── Product header ── */}
      <section className={styles.section}>
        <div className={styles.productHeader}>
          <img src={product.image} alt={product.name} className={styles.productImage} />
          <div className={styles.productInfo}>
            <h2 className={styles.productName}>{product.name}</h2>
            <p className={styles.productDesc}>{product.description}</p>
            <p className={styles.productMeta}>Size: {product.size}</p>
            <p className={styles.productMeta}>Qty: {product.qty}</p>
          </div>
        </div>
      </section>

      {/* ── Eligible for cancellation ── */}
      <section className={styles.section}>
        <div className={styles.eligibleRow}>
          <div className={styles.eligibleLeft}>
            <EligibleIcon />
            <span className={styles.eligibleText}>Eligible for cancellation</span>
          </div>
          <button className={styles.viewPolicyBtn}>View Policy</button>
        </div>
      </section>

      {/* ── Reason for cancellation ── */}
      <section className={styles.section}>
        <div className={styles.reasonSection}>
          <h3 className={styles.sectionTitle}>Reason for cancellation</h3>
          <p className={styles.sectionSub}>Please tell us the reason for cancellation. This helps us improve our service.</p>

          <div className={styles.divider} />

          <h4 className={styles.selectLabel}>Select Reason<span className={styles.required}>*</span></h4>

          <div className={styles.reasonList}>
            {CANCELLATION_REASONS.map((reason) => (
              <label key={reason} className={styles.reasonItem}>
                <input
                  type='radio'
                  name='cancelReason'
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className={styles.radio}
                />
                <span className={styles.reasonText}>{reason}</span>
              </label>
            ))}
          </div>

          <textarea
            className={styles.commentBox}
            placeholder='Additional Comment'
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />

          <p className={styles.cancelNote}>
            We will try to cancel this order. It may take upto 20 mins to confirm since it has shipped.
          </p>
        </div>
      </section>

      {/* ── Refund details + submit ── */}
      <section className={styles.section}>
        <div className={styles.refundFooter}>
          <div>
            <h3 className={styles.sectionTitle}>Refund Details</h3>
            <p className={styles.refundPrice}>₹ {order.totalPrice.toFixed(2)}</p>
          </div>
          <button className={styles.cancelBtn} disabled={!selectedReason}>
            Request Cancellation
          </button>
        </div>
      </section>
    </div>
  );
};

export default CancelOrderView;
