import { useState } from 'react';
import styles from './OrderCard.module.css';
import { STATUS_CONFIG, ORDER_STATUSES } from '../../../data/ordersData';

import CancelledStatusIcon from '../../../assets/icons/cancelled-icon.svg?react';
import ConfirmedStatusIcon from '../../../assets/icons/confirmed-icon.svg?react';
import DeliveredStatusIcon from '../../../assets/icons/delivered-icon.svg?react';
import RefundStatusIcon from '../../../assets/icons/refund-icon.svg?react';

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

const HeadsetIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M3 18v-6a9 9 0 0 1 18 0v6' />
    <path d='M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z' />
  </svg>
);

const LocationPinIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
    <circle cx='12' cy='10' r='3' />
  </svg>
);

const TruckIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <rect x='1' y='3' width='15' height='13' rx='2' />
    <polygon points='16 8 20 8 23 11 23 16 16 16 16 8' />
    <circle cx='5.5' cy='18.5' r='2.5' />
    <circle cx='18.5' cy='18.5' r='2.5' />
  </svg>
);

const ReturnIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='9 14 4 9 9 4' />
    <path d='M20 20v-7a4 4 0 0 0-4-4H4' />
  </svg>
);



const CloseIcon = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <line x1='18' y1='6' x2='6' y2='18' />
    <line x1='6' y1='6' x2='18' y2='18' />
  </svg>
);

const InfoIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ flexShrink: 0, marginTop: 2 }}>
    <circle cx='12' cy='12' r='10' />
    <line x1='12' y1='16' x2='12' y2='12' />
    <line x1='12' y1='8' x2='12.01' y2='8' />
  </svg>
);

/* ── Status Badge Icons ── */
const StatusBadgeIcon = ({ status }) => {
  if (status === ORDER_STATUSES.CANCELLED) {
    return <CancelledStatusIcon width={32} height={32} />;
  }

  if (status === ORDER_STATUSES.DELIVERED) {
    return <DeliveredStatusIcon width={32} height={32} />;
  }

  if (status === ORDER_STATUSES.REFUND_CREDITED) {
    return <RefundStatusIcon width={32} height={32} />;
  }

  // Default / Confirmed / Out For Pickup
  return <ConfirmedStatusIcon width={32} height={32} />;
};

const OrderCard = ({ order, onNavigate }) => {
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const config = STATUS_CONFIG[order.status];
  const { product } = order;

  const isConfirmed = order.status === ORDER_STATUSES.CONFIRMED || order.status === ORDER_STATUSES.PLACED;
  const isDelivered = order.status === ORDER_STATUSES.DELIVERED;
  const hasReturnWindow = isDelivered && order.returnWindowOpen;

  const handleClick = () => {
    onNavigate({ type: 'detail', orderId: order.id });
  };

  const refundInfo = order.refundDetails || {
    amount: 667,
    method: 'UPI',
    creditDate: 'Sat, 9 May',
    note: 'Have a dispute? Contact your bank with the refund transaction reference number 103269318677',
  };

  return (
    <div className={styles.card}>
      {/* ── Status header ── */}
      <div className={`${styles.statusHeader} ${order.status === ORDER_STATUSES.CANCELLED ? styles.statusHeaderCancelled : ''}`}>
        <div className={styles.statusInfo}>
          <StatusBadgeIcon status={order.status} />
          <div className={styles.statusContent}>
            <div className={styles.statusTitleRow}>
              <p className={styles.statusLabel} style={{ color: config.color }}>{config.label}</p>
              {(order.status === ORDER_STATUSES.REFUND_CREDITED || order.status === ORDER_STATUSES.OUT_FOR_PICKUP) && (
                <button
                  className={styles.viewRefundBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRefundModal(true);
                  }}
                >
                  View Refund details
                </button>
              )}
            </div>
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

      {/* ── Return window info banner for active return ── */}
      {hasReturnWindow && (
        <div className={styles.returnBanner}>
          <span>Exchange/Return available till <strong>{order.returnWindow}</strong></span>
        </div>
      )}

      {/* ── Return window closed banner ── */}
      {isDelivered && !order.returnWindowOpen && order.returnWindow && (
        <div className={styles.closedReturnBanner}>
          Exchange/Return window closed on Fri, <strong>{order.returnWindow}</strong>
        </div>
      )}

      {/* ── Action buttons for confirmed orders ── */}
      {isConfirmed && (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => onNavigate({ type: 'cancel', orderId: order.id })}>
            <CancelIcon /> Cancel Item
          </button>
          <button
            className={styles.actionBtn}
            onClick={(e) => {
              e.stopPropagation();
              setShowTrackModal(true);
            }}
          >
            <LocationPinIcon /> Track Item
          </button>
          <button className={styles.actionBtn} onClick={handleClick}>
            <HeadsetIcon /> Need Help
          </button>
        </div>
      )}

      {/* ── Action buttons for delivered orders within return window ── */}
      {hasReturnWindow && (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => onNavigate({ type: 'size-exchange', orderId: order.id })}>
            <TruckIcon /> Size Exchange
          </button>
          <button className={styles.actionBtn} onClick={() => onNavigate({ type: 'return', orderId: order.id })}>
            <ReturnIcon /> Return Item
          </button>
        </div>
      )}

      {/* ── View Refund Details Modal Popup ── */}
      {showRefundModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRefundModal(false)}>
          <div className={styles.refundModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.refundModalHeader}>
              <div>
                <h3 className={styles.refundModalTitle}>Refund Details</h3>
                <p className={styles.refundModalSubtitle}>Track your refund status and details.</p>
              </div>
              <button className={styles.closeModalBtn} onClick={() => setShowRefundModal(false)} aria-label='Close modal'>
                <CloseIcon />
              </button>
            </div>

            <div className={styles.refundModalDivider} />

            <div className={styles.refundModalBox}>
              <div>
                <span className={styles.refundModalAmount}>₹{refundInfo.amount.toFixed(2)}</span>
                <p className={styles.refundModalCreditText}>
                  Added to {refundInfo.method || 'UPI'} Credit by {refundInfo.creditDate || 'Sat, 9 May'}
                </p>
              </div>
              <span className={styles.refundModalBadge}>{refundInfo.method || 'UPI'}</span>
            </div>

            <div className={styles.refundModalNoteRow}>
              <InfoIcon />
              <p className={styles.refundModalNoteText}>{refundInfo.note}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Track Item Modal Popup ── */}
      {showTrackModal && (
        <div className={styles.modalOverlay} onClick={() => setShowTrackModal(false)}>
          <div className={styles.trackModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.trackModalHeader}>
              <div>
                <h3 className={styles.trackModalTitle}>Track Item</h3>
                <p className={styles.trackModalSubtitle}>Get live updates on your item</p>
              </div>
              <button className={styles.closeModalBtn} onClick={() => setShowTrackModal(false)} aria-label='Close modal'>
                <CloseIcon />
              </button>
            </div>

            <div className={styles.trackModalDivider} />

            <div className={styles.trackTimelineList}>
              <div className={styles.trackTimelineStep}>
                <div className={styles.trackStepIconPending}>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <circle cx='12' cy='12' r='10' />
                    <path d='M9 12l2 2 4-4' />
                  </svg>
                </div>
                <p className={styles.trackStepText}>
                  <strong>Arriving</strong> <span className={styles.trackStepDate}>by Wed, 6 May</span>
                </p>
              </div>
              <div className={styles.trackLineDashed} />

              <div className={styles.trackTimelineStep}>
                <div className={styles.trackStepIconPending}>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <circle cx='12' cy='12' r='10' />
                    <path d='M9 12l2 2 4-4' />
                  </svg>
                </div>
                <p className={styles.trackStepText}>
                  <strong>Shipped</strong> <span className={styles.trackStepDate}>by Mon, 4 May</span>
                </p>
              </div>
              <div className={styles.trackLineGreen} />

              <div className={styles.trackTimelineStep}>
                <div className={styles.trackStepIconActive}>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <circle cx='12' cy='12' r='10' fill='#16a34a' />
                    <path d='M8.5 12L10.5 14L15.5 9' stroke='#FFFFFF' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                  </svg>
                </div>
                <p className={styles.trackStepTextGreen}>
                  <strong>Oder Placed</strong> <span className={styles.trackStepDate}>on Fri, 1 May, 9:13PM</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;

