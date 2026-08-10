import styles from './OrderCard.module.css';
import { STATUS_CONFIG, ORDER_STATUSES } from '../../../data/ordersData';

/* ── Inline SVG icons ── */
const ChevronRightIcon = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='9 18 15 12 9 6' />
  </svg>
);

const CancelIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#e53935' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='10' />
    <line x1='15' y1='9' x2='9' y2='15' />
    <line x1='9' y1='9' x2='15' y2='15' />
  </svg>
);

const TrackIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#ff5f15' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
    <circle cx='12' cy='10' r='3' />
  </svg>
);

const HelpIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
    <circle cx='12' cy='12' r='10' />
    <line x1='12' y1='17' x2='12.01' y2='17' />
  </svg>
);

const ExchangeIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='17 1 21 5 17 9' />
    <path d='M3 11V9a4 4 0 0 1 4-4h14' />
    <polyline points='7 23 3 19 7 15' />
    <path d='M21 13v2a4 4 0 0 1-4 4H3' />
  </svg>
);

const ReturnIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='9 14 4 9 9 4' />
    <path d='M20 20v-7a4 4 0 0 0-4-4H4' />
  </svg>
);

/* ── Status Icon (colored dot) ── */
const StatusDot = ({ color }) => (
  <span className={styles.statusDot} style={{ background: color }} />
);

const OrderCard = ({ order, onNavigate }) => {
  const config = STATUS_CONFIG[order.status];
  const { product } = order;

  const isConfirmed = order.status === ORDER_STATUSES.CONFIRMED || order.status === ORDER_STATUSES.PLACED;
  const isDelivered = order.status === ORDER_STATUSES.DELIVERED;
  const hasReturnWindow = isDelivered && order.returnWindowOpen;

  const handleClick = () => {
    onNavigate({ type: 'detail', orderId: order.id });
  };

  return (
    <div className={styles.card}>
      {/* ── Status header ── */}
      <div className={styles.statusHeader}>
        <div className={styles.statusInfo}>
          <StatusDot color={config.color} />
          <div>
            <p className={styles.statusLabel} style={{ color: config.color }}>{config.label}</p>
            <p className={styles.statusDate}>
              {order.statusDate}
              {order.statusDetail ? ` ${order.statusDetail}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* ── Product row ── */}
      <div className={styles.productRow} onClick={handleClick}>
        <img src={product.image} alt={product.name} className={styles.productImage} />
        <div className={styles.productInfo}>
          <p className={styles.productName}>{product.name}</p>
          <p className={styles.productDesc}>{product.description}</p>
          <p className={styles.productMeta}>Size: {product.size}</p>
          <p className={styles.productMeta}>Qty: {product.qty}</p>
        </div>
        <span className={styles.chevron}>
          <ChevronRightIcon />
        </span>
      </div>

      {/* ── Return window info ── */}
      {isDelivered && order.returnWindow && (
        <p className={styles.returnInfo}>
          {order.returnWindowOpen
            ? <>
                <span className={styles.returnDot} style={{ color: '#2ecc40' }}>●</span>
                Exchange/Return available till <strong>{order.returnWindow}</strong>
              </>
            : <>Exchange/Return window closed on Fri, <strong>{order.returnWindow}</strong></>
          }
        </p>
      )}

      {/* ── Refund credited link ── */}
      {order.status === ORDER_STATUSES.REFUND_CREDITED && (
        <div className={styles.refundLink}>
          <button className={styles.viewRefundBtn} onClick={handleClick}>View Refund details</button>
        </div>
      )}

      {/* ── Action buttons for confirmed orders ── */}
      {isConfirmed && (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => onNavigate({ type: 'cancel', orderId: order.id })}>
            <CancelIcon /> Cancel Item
          </button>
          <button className={styles.actionBtn} onClick={handleClick}>
            <TrackIcon /> Track Item
          </button>
          <button className={styles.actionBtn} onClick={handleClick}>
            <HelpIcon /> Need Help
          </button>
        </div>
      )}

      {/* ── Action buttons for delivered orders within return window ── */}
      {hasReturnWindow && (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleClick}>
            <ExchangeIcon /> Style Exchange
          </button>
          <button className={styles.actionBtn} onClick={() => onNavigate({ type: 'size-exchange', orderId: order.id })}>
            <ExchangeIcon /> Size Exchange
          </button>
          <button className={styles.actionBtn} onClick={() => onNavigate({ type: 'return', orderId: order.id })}>
            <ReturnIcon /> Return Item
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;

