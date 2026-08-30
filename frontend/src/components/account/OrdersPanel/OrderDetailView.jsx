import { useState } from 'react';
import styles from '../../../pages/Account/OrderDetailPage.module.css';
import { mockOrders, STATUS_CONFIG, ORDER_STATUSES } from '../../../data/ordersData';

import DeliveredStatusIcon from '../../../assets/icons/delivered-icon.svg?react';
import CancelledStatusIcon from '../../../assets/icons/cancelled-icon.svg?react';
import ConfirmedStatusIcon from '../../../assets/icons/confirmed-icon.svg?react';

/* ── Inline SVG Icons ── */
const HeadsetIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M3 18v-6a9 9 0 0 1 18 0v6' />
    <path d='M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z' />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill={filled ? '#ff5f15' : '#e5e7eb'} stroke='none'>
    <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
  </svg>
);

const AvatarIcon = () => (
  <svg width='44' height='44' viewBox='0 0 44 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='22' cy='22' r='22' fill='#FFF0E6' />
    <circle cx='22' cy='16' r='7' fill='#F97316' />
    <path d='M10 36C10 29.3726 15.3726 24 22 24C28.6274 24 34 29.3726 34 36H10Z' fill='#F97316' />
  </svg>
);

const DeliveryAgentAvatar = () => (
  <svg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='24' cy='24' r='24' fill='#FFF0E6' />
    <path d='M14 18C14 15 18 13 24 13C30 13 34 15 34 18H14Z' fill='#FF5F15' />
    <path d='M12 18H36V20H12V18Z' fill='#FF5F15' />
    <circle cx='24' cy='22' r='7' fill='#FDBA74' />
    <path d='M12 40C12 33 17.37 28 24 28C30.63 28 36 33 36 40H12Z' fill='#FF5F15' />
    <rect x='28' y='30' width='14' height='12' rx='2' fill='#D97706' />
  </svg>
);

const InfoIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='10' />
    <line x1='12' y1='16' x2='12' y2='12' />
    <line x1='12' y1='8' x2='12.01' y2='8' />
  </svg>
);

const StyleExchangeIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#1f2937' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='17 1 21 5 17 9' />
    <path d='M3 11V9a4 4 0 0 1 4-4h14' />
    <polyline points='7 23 3 19 7 15' />
    <path d='M21 13v2a4 4 0 0 1-4 4H3' />
  </svg>
);

const SizeExchangeIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#1f2937' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z' />
  </svg>
);

const ReturnItemIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#1f2937' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='9 14 4 9 9 4' />
    <path d='M20 20v-7a4 4 0 0 0-4-4H4' />
  </svg>
);

const BellIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='#1f2937' stroke='none'>
    <path d='M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z' />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#ff5f15' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='6 9 12 15 18 9' />
  </svg>
);

const LocationPinIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#ffffff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
    <circle cx='12' cy='10' r='3' />
  </svg>
);

const CancelIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#ff5f15' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='10' />
    <line x1='15' y1='9' x2='9' y2='15' />
    <line x1='9' y1='9' x2='15' y2='15' />
  </svg>
);

const StatusIcon = ({ status }) => {
  if (status === ORDER_STATUSES.CANCELLED) {
    return <CancelledStatusIcon width={30} height={30} />;
  }
  if (status === ORDER_STATUSES.DELIVERED) {
    return <DeliveredStatusIcon width={30} height={30} />;
  }
  return <ConfirmedStatusIcon width={30} height={30} />;
};

const DownloadIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
    <polyline points='7 10 12 15 17 10' />
    <line x1='12' y1='15' x2='12' y2='3' />
  </svg>
);

const AddPhotoIcon = () => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#6b7280' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
    <rect x='3' y='3' width='18' height='18' rx='4' />
    <circle cx='8.5' cy='8.5' r='1.5' />
    <polyline points='21 15 16 10 5 21' />
    <path d='M12 7v4M10 9h4' stroke='#ff5f15' strokeWidth='2' />
  </svg>
);

const CloseIcon = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <line x1='18' y1='6' x2='6' y2='18' />
    <line x1='6' y1='6' x2='18' y2='18' />
  </svg>
);

const DELIVERY_RATINGS = [
  { emoji: '😍', label: 'Great' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Ok' },
  { emoji: '🙁', label: 'Bad' },
  { emoji: '😤', label: 'Terrible' },
];

const OrderDetailView = ({ orderId, onBack, onNavigate }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [showPriceDetailsModal, setShowPriceDetailsModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState('Great');
  const [productRating, setProductRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [reviewText, setReviewText] = useState('');

  const order = mockOrders.find((o) => o.id === Number(orderId));

  if (!order) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.notFound}>Order not found.</p>
      </div>
    );
  }

  const config = STATUS_CONFIG[order.status];
  const { product } = order;
  const isCancelled = order.status === ORDER_STATUSES.CANCELLED;
  const isConfirmed = order.status === ORDER_STATUSES.CONFIRMED || order.status === ORDER_STATUSES.PLACED;
  const isDelivered = order.status === ORDER_STATUSES.DELIVERED;
  const isPickup = order.status === ORDER_STATUSES.OUT_FOR_PICKUP;
  const hasReturnWindow = isDelivered && order.returnWindowOpen;

  return (
    <div className={styles.wrapper}>
      {/* ── Product header card ── */}
      <section className={styles.section}>
        <div className={styles.productHeader}>
          <img src={product.image} alt={product.name} className={styles.productImage} />
          <div className={styles.productInfo}>
            <h2 className={styles.productName}>{product.name}</h2>
            <p className={styles.productDesc}>{product.description}</p>
            <p className={styles.productMeta}>Size: {product.size}</p>
            <p className={styles.productMeta}>Qty: {product.qty}</p>
            <p className={styles.productMeta}>Order ID: # {order.orderId}</p>
            {order.orderedOn && <p className={styles.productMeta}>Ordered On: {order.orderedOn}</p>}
          </div>
          <button className={styles.helpBtn}>
            <HeadsetIcon /> Help
          </button>
        </div>

        {/* Action buttons (Style Exchange, Size Exchange, Return Item) for delivered items */}
        {hasReturnWindow && (
          <div className={styles.exchangeActionsRow}>
            <button className={styles.exchangeActionBtn}>
              <StyleExchangeIcon /> Style Exchange
            </button>
            <button className={styles.exchangeActionBtn} onClick={() => onNavigate({ type: 'size-exchange', orderId: order.id })}>
              <SizeExchangeIcon /> Size Exchange
            </button>
            <button className={styles.exchangeActionBtn} onClick={() => onNavigate({ type: 'return', orderId: order.id })}>
              <ReturnItemIcon /> Return Item
            </button>
          </div>
        )}
      </section>

      {/* ── Status Banner section for Out For Pickup / Cancelled / active orders ── */}
      {!isDelivered && (
        <section className={styles.section}>
          <div className={styles.statusTimelineCard}>
            {/* Arrival estimate row for active orders */}
            {isConfirmed && order.statusDate && (
              <>
                <div className={styles.arrivalRow}>
                  <span className={styles.arrivalCheckIcon}>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                      <circle cx='12' cy='12' r='10' />
                      <path d='M9 12l2 2 4-4' />
                    </svg>
                  </span>
                  <p className={styles.arrivalText}>
                    {order.statusDate.toLowerCase().startsWith('arriving') ? order.statusDate : `Arriving by ${order.statusDate}`}
                  </p>
                </div>
                <div className={styles.verticalConnector} />
              </>
            )}

            {/* Status Banner */}
            <div className={`${styles.statusBanner} ${isCancelled ? styles.statusBannerCancelled : ''}`}>
              <div className={styles.statusBannerIcon}>
                <StatusIcon status={order.status} />
              </div>
              <div className={styles.statusBannerInner}>
                <p className={styles.statusLabel}>{config.label}</p>
                <p className={styles.statusDate}>
                  {isConfirmed
                    ? `Order placed ${order.trackingSteps?.[0]?.date || 'on 01 May'}`
                    : order.pickupDate || order.statusDate}
                </p>
              </div>
            </div>

            {/* Vertical line down to tracking step */}
            {isConfirmed && <div className={styles.verticalConnector} />}

            {/* Tracking timeline step for active order */}
            {isConfirmed && (
              <div className={styles.timelineContainer}>
                <div className={styles.timelineStep}>
                  <div className={styles.timelineCheckBadge}>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <circle cx='12' cy='12' r='10' fill='#16a34a' />
                      <path d='M8.5 12L10.5 14L15.5 9' stroke='#FFFFFF' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                  </div>
                  <p className={styles.timelineText}>
                    <span>Order placed</span> <span className={styles.timelineDate}>{order.trackingSteps?.[0]?.date || 'on 01 May'}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons (Cancel Item & Track Item) */}
            {isConfirmed && (
              <div className={styles.activeOrderActions}>
                <button className={styles.cancelOutlineBtn} onClick={() => onNavigate({ type: 'cancel', orderId: order.id })}>
                  <CancelIcon /> Cancel Item
                </button>
                <button className={styles.trackPrimaryBtn} onClick={() => setShowTrackModal(true)}>
                  <LocationPinIcon /> Track Item
                </button>
              </div>
            )}
          </div>

          {/* ── More items strip (if multiple products) ── */}
          {order.otherItems && order.otherItems.length > 0 && (
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
          )}
        </section>
      )}

      {/* ── Refund Details Card (for Out For Pickup / Refund Credited) ── */}
      {order.refundDetails && (
        <section className={styles.section}>
          <div className={styles.refundDetailsCard}>
            <h3 className={styles.sectionTitle}>Refund Details</h3>
            <div className={styles.refundTotalRow}>
              <span className={styles.refundTotalLabel}>Total Refund Amount</span>
              <span className={styles.refundTotalValue}>₹{order.refundDetails.amount.toFixed(2)}</span>
            </div>
            <div className={styles.refundMethodBox}>
              <div>
                <span className={styles.refundMethodAmount}>₹{order.refundDetails.amount.toFixed(2)}</span>
                {order.refundDetails.creditDate && (
                  <p className={styles.refundCreditSub}>
                    Added to {order.refundDetails.method} Credit by {order.refundDetails.creditDate}
                  </p>
                )}
              </div>
              <span className={styles.refundBadge}>{order.refundDetails.method}</span>
            </div>
            <div className={styles.refundNoteRow}>
              <InfoIcon />
              <span className={styles.refundNoteText}>{order.refundDetails.note}</span>
            </div>
          </div>
        </section>
      )}

      {/* ── Rate your delivery experience (After Delivery UI) ── */}
      {isDelivered && (
        <section className={styles.section}>
          <div className={styles.deliveryExpSection}>
            <div className={styles.deliveryExpHeader}>
              <DeliveryAgentAvatar />
              <div>
                <h3 className={styles.sectionTitle}>Rate your delivery experience</h3>
                <p className={styles.sectionSub}>How do you rate your experience for this order?</p>
              </div>
            </div>
            <div className={styles.emojiRow}>
              {DELIVERY_RATINGS.map((r) => (
                <button
                  key={r.label}
                  className={styles.emojiBtn}
                  onClick={() => {
                    setSelectedRating(r.label);
                    setShowFeedbackModal(true);
                  }}
                >
                  <span className={styles.emoji}>{r.emoji}</span>
                  <span className={styles.emojiLabel}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Rate & Review card ── */}
      <section className={styles.section}>
        <div className={styles.reviewSection}>
          <div className={styles.reviewHeader}>
            <h3 className={styles.sectionTitle}>Rate & Review</h3>
            <button className={styles.writeReviewBtn} onClick={() => setShowWriteReviewModal(true)}>
              Write Review
            </button>
          </div>
          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={styles.starBtn}
                onClick={() => {
                  setProductRating(n);
                  setShowWriteReviewModal(true);
                }}
              >
                <StarIcon filled={n <= productRating} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Delivery info card ── */}
      <section className={styles.section}>
        <div className={styles.deliveryCard}>
          <div className={styles.deliveryUserRow}>
            <AvatarIcon />
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

      {/* ── Other items in this delivery section (for multiple products case) ── */}
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

      {/* ── Total order price card ── */}
      <section className={styles.section}>
        <div className={styles.priceSection}>
          <div className={styles.priceRow} onClick={() => setShowPriceDetailsModal(true)}>
            <h3 className={styles.sectionTitle}>Total Order Price</h3>
            <div className={styles.priceValue}>
              <span>₹ {order.totalPrice.toFixed(2)}</span>
              <ChevronDownIcon />
            </div>
          </div>
          <button className={styles.invoiceBtn} onClick={() => setShowPriceDetailsModal(true)}>
            Get Invoice
          </button>
        </div>
      </section>

      {/* ── Updates sent to card ── */}
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

      {/* ── Delivery Partner Feedback Modal Popup ── */}
      {showFeedbackModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFeedbackModal(false)}>
          <div className={styles.feedbackModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.feedbackModalHeader}>
              <div>
                <h3 className={styles.feedbackModalTitle}>Delivery Partner Feedback</h3>
                <p className={styles.feedbackModalSubtitle}>Help us improve with your feedback.</p>
              </div>
              <button className={styles.closeModalBtn} onClick={() => setShowFeedbackModal(false)} aria-label='Close modal'>
                <CloseIcon />
              </button>
            </div>

            <div className={styles.feedbackModalDivider} />

            <div className={styles.feedbackModalBody}>
              <h4 className={styles.feedbackSectionLabel}>Your Rating</h4>
              <div className={styles.modalEmojiRow}>
                {DELIVERY_RATINGS.map((r) => (
                  <button
                    key={r.label}
                    className={`${styles.modalEmojiBtn} ${selectedRating === r.label ? styles.modalEmojiBtnSelected : ''}`}
                    onClick={() => setSelectedRating(r.label)}
                  >
                    <span className={styles.modalEmoji}>{r.emoji}</span>
                    <span className={styles.modalEmojiLabel}>{r.label}</span>
                  </button>
                ))}
              </div>

              <h4 className={styles.feedbackSectionLabel}>Feedback</h4>
              <textarea
                className={styles.feedbackTextarea}
                placeholder='Write something here...'
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
              />

              <p className={styles.termsText}>
                By submitting a review, you agree to our <a href='#' className={styles.termsLink}>Terms</a> & <a href='#' className={styles.termsLink}>Privacy Policy.</a>
              </p>

              <button className={styles.submitFeedbackBtn} onClick={() => setShowFeedbackModal(false)}>
                Submit
              </button>
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

      {/* ── Rate Our Product / Write Review Modal Popup ── */}
      {showWriteReviewModal && (
        <div className={styles.modalOverlay} onClick={() => setShowWriteReviewModal(false)}>
          <div className={styles.reviewModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.reviewModalHeader}>
              <div>
                <h3 className={styles.reviewModalTitle}>Rate Our Product</h3>
                <p className={styles.reviewModalSubtitle}>Provide us with feedback for the product.</p>
              </div>
              <button className={styles.closeModalBtn} onClick={() => setShowWriteReviewModal(false)} aria-label='Close modal'>
                <CloseIcon />
              </button>
            </div>

            <div className={styles.reviewModalDivider} />

            <div className={styles.reviewModalBody}>
              <h4 className={styles.reviewSectionLabel}>Your Rating</h4>
              <div className={styles.modalStarRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className={`${styles.modalStarBox} ${n <= productRating ? styles.modalStarBoxSelected : ''}`}
                    onClick={() => setProductRating(n)}
                  >
                    <StarIcon filled={n <= productRating} />
                  </button>
                ))}
              </div>

              <h4 className={styles.reviewSectionLabel}>Product Review</h4>
              <textarea
                className={styles.reviewTextarea}
                placeholder='Provide a detailed review...'
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
              />

              <h4 className={styles.reviewSectionLabel}>Add Photo</h4>
              <label className={styles.addPhotoBox}>
                <input type='file' accept='image/*' className={styles.fileInputHidden} />
                <AddPhotoIcon />
                <span className={styles.addPhotoLabel}>Add Photo</span>
              </label>

              <p className={styles.termsText}>
                By submitting a review, you agree to our <a href='#' className={styles.termsLink}>Terms</a> & <a href='#' className={styles.termsLink}>Privacy Policy.</a>
              </p>

              <button className={styles.submitReviewBtn} onClick={() => setShowWriteReviewModal(false)}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Price Details Modal Popup ── */}
      {showPriceDetailsModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPriceDetailsModal(false)}>
          <div className={styles.priceModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.priceModalHeader}>
              <div>
                <h3 className={styles.priceModalTitle}>Price Details</h3>
                <p className={styles.priceModalSubtitle}>Provide us with feedback for the product.</p>
              </div>
              <button className={styles.closeModalBtn} onClick={() => setShowPriceDetailsModal(false)} aria-label='Close modal'>
                <CloseIcon />
              </button>
            </div>

            <div className={styles.priceModalDivider} />

            <div className={styles.priceModalContent}>
              <div className={styles.priceBreakdownBox}>
                <div className={styles.priceBreakdownRow}>
                  <span>1 x {product.name}</span>
                  <span>₹2,499.00</span>
                </div>
                <div className={styles.priceBreakdownRow}>
                  <span>Discount</span>
                  <span>-₹1,000.00</span>
                </div>
                <div className={styles.priceDottedLine} />
                <div className={styles.priceBreakdownRow}>
                  <span>Discounted Price</span>
                  <span className={styles.boldPrice}>₹1,499.00</span>
                </div>
                <div className={styles.priceDottedLine} />
                <div className={styles.priceBreakdownRow}>
                  <span>Cash/Pay On Delivery</span>
                  <span>₹90.00</span>
                </div>
                <div className={styles.priceDottedLine} />
                <div className={styles.priceBreakdownRowBold}>
                  <span>Total Paid</span>
                  <span>₹1,589.00</span>
                </div>

                <div className={styles.paidByBox}>
                  <span>Paid By</span>
                  <span className={styles.paidByMethod}>UPI Payment</span>
                </div>
                <button className={styles.downloadInvoiceBtn} onClick={() => setShowPriceDetailsModal(false)}>
                <DownloadIcon /> Download Invoice
              </button>
              </div>

              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailView;
