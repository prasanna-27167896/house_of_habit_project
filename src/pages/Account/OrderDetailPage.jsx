import { useParams, useNavigate } from 'react-router-dom';
import styles from './OrderDetailPage.module.css';
import { mockOrders, STATUS_CONFIG, ORDER_STATUSES } from '../../data/ordersData';

/* ── Inline SVG Icons ── */
const BackIcon = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='15 18 9 12 15 6' />
  </svg>
);

const HelpBtnIcon = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
    <circle cx='12' cy='12' r='10' />
    <line x1='12' y1='17' x2='12.01' y2='17' />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width='28' height='28' viewBox='0 0 24 24' fill={filled ? '#ff5f15' : 'none'} stroke={filled ? '#ff5f15' : '#ccc'} strokeWidth='1.5'>
    <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
  </svg>
);

const BellIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='#28282b' stroke='none'>
    <path d='M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z' />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='6 9 12 15 18 9' />
  </svg>
);

const CheckIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#2ecc40' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
    <polyline points='22 4 12 14.01 9 11.01' />
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
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
    <circle cx='12' cy='10' r='3' />
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

const InfoIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#999' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='10' />
    <line x1='12' y1='16' x2='12' y2='12' />
    <line x1='12' y1='8' x2='12.01' y2='8' />
  </svg>
);

/* ── Delivery experience emojis ── */
const DELIVERY_RATINGS = [
  { emoji: '😍', label: 'Great' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Ok' },
  { emoji: '😕', label: 'Bad' },
  { emoji: '😤', label: 'Terrible' },
];

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const order = mockOrders.find((o) => o.id === Number(orderId));

  if (!order) {
    return (
      <main>
        <div className='container'>
          <div className={styles.wrapper}>
            <button className={styles.backBtn} onClick={() => navigate('/account')}>
              <BackIcon /> Back to Orders
            </button>
            <p className={styles.notFound}>Order not found.</p>
          </div>
        </div>
      </main>
    );
  }

  const config = STATUS_CONFIG[order.status];
  const { product } = order;
  const isConfirmed = order.status === ORDER_STATUSES.CONFIRMED || order.status === ORDER_STATUSES.PLACED;
  const isDelivered = order.status === ORDER_STATUSES.DELIVERED;
  const hasReturnWindow = isDelivered && order.returnWindowOpen;
  const hasRefund = order.status === ORDER_STATUSES.OUT_FOR_PICKUP || order.status === ORDER_STATUSES.REFUND_CREDITED;

  return (
    <main>
      <div className='container'>
        <div className={styles.wrapper}>
          {/* ── Back button ── */}
          <button className={styles.backBtn} onClick={() => navigate('/account')}>
            <BackIcon /> Back to Orders
          </button>

          {/* ── Product header ── */}
          <section className={styles.section}>
            <div className={styles.productHeader}>
              <img src={product.image} alt={product.name} className={styles.productImage} />
              <div className={styles.productInfo}>
                <h2 className={styles.productName}>{product.name}</h2>
                <p className={styles.productDesc}>{product.description}</p>
                <p className={styles.productMeta}>Size: {product.size}</p>
                <p className={styles.productMeta}>Qty: {product.qty}</p>
                <p className={styles.productMeta}>Order ID: # {order.orderId}</p>
                <p className={styles.productMeta}>Ordered On: {order.orderedOn}</p>
              </div>
              <button className={styles.helpBtn}>
                <HelpBtnIcon /> Help
              </button>
            </div>
          </section>

          {/* ── Arrival estimate (for confirmed/placed) ── */}
          {isConfirmed && (
            <section className={styles.section}>
              <div className={styles.arrivalRow}>
                <span className={styles.arrivalDot} />
                <p className={styles.arrivalText}>{order.statusDate}</p>
              </div>
            </section>
          )}

          {/* ── Status banner ── */}
          <section className={styles.statusBanner} style={{ '--status-color': config.color }}>
            <div className={styles.statusBannerInner}>
              <p className={styles.statusLabel}>{config.label}</p>
              <p className={styles.statusDate}>{order.statusDate}</p>
            </div>
          </section>

          {/* ── Tracking timeline (for placed/confirmed) ── */}
          {order.trackingSteps && order.trackingSteps.length > 0 && (
            <section className={styles.section}>
              <div className={styles.timeline}>
                {order.trackingSteps.map((step, idx) => (
                  <div key={idx} className={styles.timelineStep}>
                    <div className={styles.timelineIcon}>
                      {step.completed ? <CheckIcon /> : <span className={styles.timelinePending} />}
                    </div>
                    <p className={styles.timelineLabel}>
                      {step.label} <span className={styles.timelineDate}>{step.date}</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Action buttons (confirmed: Cancel + Track) ── */}
          {isConfirmed && (
            <section className={styles.section}>
              <div className={styles.detailActions}>
                <button className={styles.outlineBtn} onClick={() => navigate(`/account/order/${order.id}/cancel`)}>
                  <CancelIcon /> Cancel Item
                </button>
                <button className={styles.primaryBtn}>
                  <TrackIcon /> Track Item
                </button>
              </div>
            </section>
          )}

          {/* ── Action buttons (delivered with return window: Exchange + Return) ── */}
          {hasReturnWindow && (
            <section className={styles.section}>
              <div className={styles.exchangeActions}>
                <button className={styles.exchangeBtn}>
                  <ExchangeIcon /> Style Exchange
                </button>
                <button className={styles.exchangeBtn} onClick={() => navigate(`/account/order/${order.id}/size-exchange`)}>
                  <ExchangeIcon /> Size Exchange
                </button>
                <button className={styles.exchangeBtn} onClick={() => navigate(`/account/order/${order.id}/return`)}>
                  <ReturnIcon /> Return Item
                </button>
              </div>
            </section>
          )}

          {/* ── More items in order ── */}
          {order.otherItems && order.otherItems.length > 0 && (
            <section className={styles.section}>
              <div className={styles.moreItemsRow}>
                <div className={styles.moreItemsThumbs}>
                  {order.otherItems.slice(0, 2).map((item, i) => (
                    <img key={i} src={item.image} alt={item.name} className={styles.moreItemThumb} />
                  ))}
                </div>
                <p className={styles.moreItemsText}>
                  {order.otherItems.length} more items in this 📦 order
                </p>
              </div>
            </section>
          )}

          {/* ── Refund details (for out-for-pickup / refund-credited) ── */}
          {hasRefund && order.refundDetails && (
            <section className={styles.section}>
              <div className={styles.refundSection}>
                <h3 className={styles.sectionTitle}>Refund Details</h3>
                <div className={styles.refundRow}>
                  <span>Total Refund Amount</span>
                  <span className={styles.refundAmount}>₹{order.refundDetails.amount.toFixed(2)}</span>
                </div>
                <div className={styles.refundMethodRow}>
                  <span className={styles.refundMethodAmount}>₹{order.refundDetails.amount.toFixed(2)}</span>
                  {order.refundDetails.creditDate && (
                    <span className={styles.refundCreditDate}>Added to UPI Credit by {order.refundDetails.creditDate}</span>
                  )}
                  <span className={styles.refundMethodBadge}>{order.refundDetails.method}</span>
                </div>
                <div className={styles.refundNote}>
                  <InfoIcon />
                  <span>{order.refundDetails.note}</span>
                </div>
              </div>
            </section>
          )}

          {/* ── Delivery experience rating (after delivery) ── */}
          {isDelivered && (
            <section className={styles.section}>
              <div className={styles.deliveryExpSection}>
                <div className={styles.deliveryExpHeader}>
                  <div className={styles.deliveryExpIcon}>📦</div>
                  <div>
                    <h3 className={styles.sectionTitle}>Rate your delivery experience</h3>
                    <p className={styles.sectionSub}>How do you rate your experience for this order?</p>
                  </div>
                </div>
                <div className={styles.emojiRow}>
                  {DELIVERY_RATINGS.map((r) => (
                    <button key={r.label} className={styles.emojiBtn}>
                      <span className={styles.emoji}>{r.emoji}</span>
                      <span className={styles.emojiLabel}>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Rate & Review ── */}
          <section className={styles.section}>
            <div className={styles.reviewSection}>
              <div className={styles.reviewHeader}>
                <h3 className={styles.sectionTitle}>Rate & Review</h3>
                <button className={styles.writeReviewBtn}>Write Review</button>
              </div>
              <div className={styles.starRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} className={styles.starBtn}>
                    <StarIcon filled={false} />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Delivery info ── */}
          <section className={styles.section}>
            <div className={styles.deliveryCard}>
              <div className={styles.deliveryUserRow}>
                <div className={styles.deliveryAvatar}>
                  {order.deliveryInfo.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className={styles.sectionTitle}>Delivery To</h3>
                  <p className={styles.deliveryName}>{order.deliveryInfo.name}</p>
                </div>
              </div>
              <div className={styles.deliveryDetails}>
                <h4 className={styles.deliveryLabel}>Contact Details</h4>
                <p className={styles.deliveryValue}>{order.deliveryInfo.phone}</p>
                <h4 className={styles.deliveryLabel}>Delivery Address</h4>
                <p className={styles.deliveryValue}>{order.deliveryInfo.address}</p>
              </div>
            </div>
          </section>

          {/* ── Other items in this delivery ── */}
          {order.otherItems && order.otherItems.length > 0 && (
            <section className={styles.section}>
              <div className={styles.otherItemsSection}>
                <h3 className={styles.sectionTitle}>Other items in this Delivery</h3>
                <p className={styles.otherItemsOrderId}>Order ID # {order.orderId}</p>
                <div className={styles.otherItemsList}>
                  {order.otherItems.map((item, i) => (
                    <div key={i} className={styles.otherItemRow}>
                      <img src={item.image} alt={item.name} className={styles.otherItemImage} />
                      <div>
                        <p className={styles.otherItemName}>{item.name}</p>
                        <p className={styles.otherItemDesc}>{item.description}</p>
                        <p className={styles.otherItemMeta}>Size: {item.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Total order price ── */}
          <section className={styles.section}>
            <div className={styles.priceSection}>
              <div className={styles.priceRow}>
                <h3 className={styles.sectionTitle}>Total Order Price</h3>
                <div className={styles.priceValue}>
                  <span>₹ {order.totalPrice.toFixed(2)}</span>
                  <ChevronDownIcon />
                </div>
              </div>
              <button className={styles.invoiceBtn}>Get Invoice</button>
            </div>
          </section>

          {/* ── Updates sent to ── */}
          <section className={styles.section}>
            <div className={styles.updatesSection}>
              <div className={styles.updatesHeader}>
                <BellIcon />
                <h3 className={styles.sectionTitle}>Updates sent to</h3>
              </div>
              <h4 className={styles.deliveryLabel}>Call</h4>
              <p className={styles.deliveryValue}>{order.deliveryInfo.phone}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default OrderDetailPage;
