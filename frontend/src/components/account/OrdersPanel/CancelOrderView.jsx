import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../../../pages/Account/CancelOrderPage.module.css';
import { normalizeOrder } from '../../../data/ordersData';
import { cancelUserOrder } from '../../../store/slices/orderSlice';

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
  const dispatch = useDispatch();
  const { orders, currentOrder, actionLoading } = useSelector((state) => state.order);

  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const rawOrder = useMemo(() => {
    if (currentOrder && (String(currentOrder.orderId) === String(orderId) || String(currentOrder.id) === String(orderId))) {
      return currentOrder;
    }
    return orders.find((o) => String(o.orderId) === String(orderId) || String(o.id) === String(orderId));
  }, [currentOrder, orders, orderId]);

  const order = useMemo(() => {
    return normalizeOrder(rawOrder);
  }, [rawOrder]);

  if (!order) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.notFound}>Order not found.</p>
      </div>
    );
  }

  const { product } = order;

  const handleCancelSubmit = async () => {
    if (!selectedReason || actionLoading) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await dispatch(
        cancelUserOrder({
          orderId: order.id,
          reason: selectedReason,
          comment: comment || undefined,
        })
      ).unwrap();

      setSuccessMsg('Your order has been successfully cancelled.');
      setTimeout(() => {
        onBack({ type: 'detail', orderId: order.id });
      }, 1500);
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : 'Unable to cancel this order. It may have already been shipped.');
    }
  };

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
          <button className={styles.viewPolicyBtn} onClick={() => alert('Orders can be cancelled before dispatch without any cancellation fee.')}>
            View Policy
          </button>
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
            placeholder='Additional Comment (optional)'
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />

          {errorMsg && (
            <p style={{ color: '#e53935', fontSize: '13px', margin: '8px 0' }}>
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p style={{ color: '#16a34a', fontSize: '13px', margin: '8px 0' }}>
              {successMsg}
            </p>
          )}

          <p className={styles.cancelNote}>
            Once requested, the order will be cancelled and any prepaid amount will be refunded.
          </p>
        </div>
      </section>

      {/* ── Refund details + submit ── */}
      <section className={styles.section}>
        <div className={styles.refundFooter}>
          <div>
            <h3 className={styles.sectionTitle}>Refund Details</h3>
            <p className={styles.refundPrice}>₹ {Number(order.totalPrice).toFixed(2)}</p>
          </div>
          <button
            className={styles.cancelBtn}
            disabled={!selectedReason || actionLoading || successMsg}
            onClick={handleCancelSubmit}
          >
            {actionLoading ? 'Cancelling...' : 'Request Cancellation'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default CancelOrderView;
