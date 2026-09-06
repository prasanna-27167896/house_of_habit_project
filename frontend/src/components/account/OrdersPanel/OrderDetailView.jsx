import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../../../pages/Account/OrderDetailPage.module.css';
import { getStatusConfig, ORDER_STATUSES, normalizeOrder } from '../../../data/ordersData';
import { fetchOrderById, fetchOrderTracking, submitDeliveryFeedback, downloadInvoice } from '../../../store/slices/orderSlice';
import { uploadReviewPhoto, createProductReview } from '../../../services/reviewService';

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
  const upper = String(status).toUpperCase();
  if (upper === 'CANCELLED') {
    return <CancelledStatusIcon width={30} height={30} />;
  }
  if (upper === 'DELIVERED') {
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
  { emoji: '😍', label: 'Great', score: 5 },
  { emoji: '🙂', label: 'Good', score: 4 },
  { emoji: '😐', label: 'Ok', score: 3 },
  { emoji: '🙁', label: 'Bad', score: 2 },
  { emoji: '😤', label: 'Terrible', score: 1 },
];

const OrderDetailView = ({ orderId, onBack, onNavigate }) => {
  const dispatch = useDispatch();
  const { orders, currentOrder, currentOrderLoading, trackingData, trackingLoading } = useSelector((state) => state.order);

  // Modals state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [showPriceDetailsModal, setShowPriceDetailsModal] = useState(false);

  // Feedback form state
  const [selectedRating, setSelectedRating] = useState('Great');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Review form state
  const [productRating, setProductRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewFile, setReviewFile] = useState(null);
  const [reviewFilePreview, setReviewFilePreview] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);

  // Invoice downloading state
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Fetch full details if needed
  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId]);

  // Find order in memory or use currentOrder
  const rawOrder = useMemo(() => {
    if (currentOrder && (String(currentOrder.orderId) === String(orderId) || String(currentOrder.id) === String(orderId))) {
      return currentOrder;
    }
    return orders.find((o) => String(o.orderId) === String(orderId) || String(o.id) === String(orderId));
  }, [currentOrder, orders, orderId]);

  const order = useMemo(() => {
    return normalizeOrder(rawOrder);
  }, [rawOrder]);

  const handleOpenTrack = () => {
    if (orderId) {
      dispatch(fetchOrderTracking(orderId));
    }
    setShowTrackModal(true);
  };

  const handleDownloadInvoice = async () => {
    if (!orderId || invoiceLoading) return;
    setInvoiceLoading(true);
    try {
      await dispatch(downloadInvoice(orderId)).unwrap();
    } catch (err) {
      alert(err || 'Failed to download invoice.');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!orderId || feedbackSubmitting) return;
    const ratingObj = DELIVERY_RATINGS.find((r) => r.label === selectedRating) || DELIVERY_RATINGS[0];
    setFeedbackSubmitting(true);
    setFeedbackMessage(null);
    try {
      await dispatch(
        submitDeliveryFeedback({
          orderId,
          rating: ratingObj.score,
          comment: feedbackText,
        })
      ).unwrap();
      setFeedbackMessage('Thank you for rating your delivery experience!');
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackMessage(null);
      }, 1500);
    } catch (err) {
      setFeedbackMessage(typeof err === 'string' ? err : 'Feedback submission failed or already submitted.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setReviewError('Photo must be less than 5MB.');
        return;
      }
      setReviewFile(file);
      setReviewFilePreview(URL.createObjectURL(file));
      setReviewError(null);
    }
  };

  const handleReviewSubmit = async () => {
    if (!productRating || reviewSubmitting) return;

    // We need productId of the item
    const firstItem = (rawOrder?.orderItems && rawOrder.orderItems[0]) || {};
    const pId = order?.product?.productId || firstItem.variant?.productId || firstItem.productId;

    if (!pId && !firstItem.orderItemId) {
      setReviewError('Could not identify product to review.');
      return;
    }

    setReviewSubmitting(true);
    setReviewError(null);
    setReviewSuccess(null);

    try {
      let imageData = null;
      if (reviewFile) {
        // Step 1 & 2: Presign & direct Cloudflare PUT
        imageData = await uploadReviewPhoto(reviewFile);
      }

      // Step 3: Submit review to backend
      const targetProductId = pId || firstItem.orderItemId;
      await createProductReview(targetProductId, {
        rating: productRating,
        title: reviewTitle || undefined,
        body: reviewText || undefined,
        imageUrl: imageData?.imageUrl,
        imageKey: imageData?.imageKey,
      });

      setReviewSuccess('Review submitted successfully! Thank you.');
      setTimeout(() => {
        setShowWriteReviewModal(false);
        setReviewSuccess(null);
        setReviewFile(null);
        setReviewFilePreview(null);
        setReviewText('');
        setReviewTitle('');
      }, 1800);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit review.';
      setReviewError(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (currentOrderLoading && !order) {
    return (
      <div className={styles.wrapper} style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className="dots-loading" style={{ margin: '0 auto', color: '#ff5f15' }}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.notFound}>Order not found.</p>
      </div>
    );
  }

  const config = getStatusConfig(order.status);
  const { product } = order;
  const status = (order.status || '').toUpperCase();
  const isCancelled = status === 'CANCELLED';
  const isConfirmed =
    status === 'CONFIRMED' ||
    status === 'ORDER_PLACED' ||
    status === 'PROCESSING' ||
    status === 'PENDING';
  const isDelivered = status === 'DELIVERED';
  const isPickup = status === 'RETURN_REQUESTED' || status === 'OUT_FOR_PICKUP';
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
          <button className={styles.helpBtn} onClick={() => alert('Support team will contact you shortly.')}>
            <HeadsetIcon /> Help
          </button>
        </div>

        {/* Action buttons (Style Exchange, Size Exchange, Return Item) for delivered items */}
        {hasReturnWindow && (
          <div className={styles.exchangeActionsRow}>
            <button
              className={styles.exchangeActionBtn}
              onClick={() => onNavigate({ type: 'size-exchange', orderId: order.id })}
            >
              <StyleExchangeIcon /> Style Exchange
            </button>
            <button
              className={styles.exchangeActionBtn}
              onClick={() => onNavigate({ type: 'size-exchange', orderId: order.id })}
            >
              <SizeExchangeIcon /> Size Exchange
            </button>
            <button
              className={styles.exchangeActionBtn}
              onClick={() => onNavigate({ type: 'return', orderId: order.id })}
            >
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
                <p className={styles.statusLabel} style={{ color: '#ffffff' }}>{config.label}</p>
                <p className={styles.statusDate} style={{ color: '#ffffff' }}>
                  {isConfirmed
                    ? `Order Placed ${order.orderedOn || ''}`
                    : order.statusDate}
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
                    <span>Order placed</span> <span className={styles.timelineDate}>{order.orderedOn ? `on ${order.orderedOn}` : ''}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons (Cancel Item & Track Item) */}
            {isConfirmed && (
              <div className={styles.activeOrderActions}>
                <button
                  className={styles.cancelOutlineBtn}
                  onClick={() => onNavigate({ type: 'cancel', orderId: order.id })}
                >
                  <CancelIcon /> Cancel Item
                </button>
                <button className={styles.trackPrimaryBtn} onClick={handleOpenTrack}>
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
              <span className={styles.refundTotalValue}>₹{Number(order.refundDetails.amount).toFixed(2)}</span>
            </div>
            <div className={styles.refundMethodBox}>
              <div>
                <span className={styles.refundMethodAmount}>₹{Number(order.refundDetails.amount).toFixed(2)}</span>
                {order.refundDetails.creditDate && (
                  <p className={styles.refundCreditSub}>
                    Added to {order.refundDetails.method} Credit by {order.refundDetails.creditDate}
                  </p>
                )}
              </div>
              <span className={styles.refundBadge}>{order.refundDetails.method || 'UPI'}</span>
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
              <span>₹ {Number(order.totalPrice).toFixed(2)}</span>
              <ChevronDownIcon />
            </div>
          </div>
          <button className={styles.invoiceBtn} onClick={handleDownloadInvoice} disabled={invoiceLoading}>
            {invoiceLoading ? 'Downloading...' : 'Get Invoice'}
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
          <h4 className={styles.deliveryLabel}>Call / WhatsApp</h4>
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
                placeholder='Write something about the delivery experience...'
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
              />

              {feedbackMessage && (
                <p style={{ margin: '8px 0', fontSize: '13px', color: feedbackMessage.includes('Thank') ? '#16a34a' : '#e53935' }}>
                  {feedbackMessage}
                </p>
              )}

              <p className={styles.termsText}>
                By submitting feedback, you agree to our <a href='#' className={styles.termsLink}>Terms</a> & <a href='#' className={styles.termsLink}>Privacy Policy.</a>
              </p>

              <button
                className={styles.submitFeedbackBtn}
                onClick={handleFeedbackSubmit}
                disabled={feedbackSubmitting}
              >
                {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
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
                <p className={styles.trackModalSubtitle}>Get live updates on your order</p>
              </div>
              <button className={styles.closeModalBtn} onClick={() => setShowTrackModal(false)} aria-label='Close modal'>
                <CloseIcon />
              </button>
            </div>

            <div className={styles.trackModalDivider} />

            <div className={styles.trackTimelineList}>
              {trackingLoading ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <div className="dots-loading" style={{ margin: '0 auto', color: '#ff5f15' }}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              ) : trackingData?.timeline && trackingData.timeline.length > 0 ? (
                trackingData.timeline.map((item, idx) => (
                  <div key={idx}>
                    <div className={styles.trackTimelineStep}>
                      <div className={styles.trackStepIconActive}>
                        <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <circle cx='12' cy='12' r='10' fill='#16a34a' />
                          <path d='M8.5 12L10.5 14L15.5 9' stroke='#FFFFFF' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                        </svg>
                      </div>
                      <p className={styles.trackStepTextGreen}>
                        <strong>{item.status || 'Status Update'}</strong>{' '}
                        <span className={styles.trackStepDate}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleString('en-GB') : ''}
                        </span>
                      </p>
                    </div>
                    {item.description && (
                      <p style={{ margin: '4px 0 12px 34px', fontSize: '13px', color: '#666' }}>
                        {item.description}
                      </p>
                    )}
                    {idx < trackingData.timeline.length - 1 && <div className={styles.trackLineGreen} />}
                  </div>
                ))
              ) : (
                <>
                  <div className={styles.trackTimelineStep}>
                    <div className={styles.trackStepIconActive}>
                      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <circle cx='12' cy='12' r='10' fill='#16a34a' />
                        <path d='M8.5 12L10.5 14L15.5 9' stroke='#FFFFFF' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                      </svg>
                    </div>
                    <p className={styles.trackStepTextGreen}>
                      <strong>Status: {config.label}</strong>{' '}
                      <span className={styles.trackStepDate}>{order.statusDate}</span>
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
                      <strong>Order Placed</strong> <span className={styles.trackStepDate}>{order.orderedOn ? `on ${order.orderedOn}` : ''}</span>
                    </p>
                  </div>
                </>
              )}
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
                <p className={styles.reviewModalSubtitle}>Share your feedback with future buyers.</p>
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
                    type='button'
                    className={`${styles.modalStarBox} ${n <= productRating ? styles.modalStarBoxSelected : ''}`}
                    onClick={() => setProductRating(n)}
                  >
                    <StarIcon filled={n <= productRating} />
                  </button>
                ))}
              </div>

              <h4 className={styles.reviewSectionLabel}>Review Title</h4>
              <input
                type='text'
                className={styles.feedbackTextarea}
                style={{ height: '42px', minHeight: '42px', marginBottom: '12px' }}
                placeholder='e.g. Great fit and fabric quality'
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
              />

              <h4 className={styles.reviewSectionLabel}>Product Review</h4>
              <textarea
                className={styles.reviewTextarea}
                placeholder='Provide a detailed review about size, fabric, and fit...'
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
              />

              <h4 className={styles.reviewSectionLabel}>Add Photo (Direct Upload)</h4>
              <label className={styles.addPhotoBox} style={{ cursor: 'pointer' }}>
                <input
                  type='file'
                  accept='image/jpeg,image/png,image/webp'
                  className={styles.fileInputHidden}
                  onChange={handlePhotoSelect}
                />
                <AddPhotoIcon />
                <span className={styles.addPhotoLabel}>
                  {reviewFile ? reviewFile.name : 'Add Photo (JPEG, PNG, WebP up to 5MB)'}
                </span>
              </label>

              {reviewFilePreview && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={reviewFilePreview}
                    alt='Preview'
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <button
                    type='button'
                    onClick={() => {
                      setReviewFile(null);
                      setReviewFilePreview(null);
                    }}
                    style={{ fontSize: '12px', color: '#e53935', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Remove Photo
                  </button>
                </div>
              )}

              {reviewError && (
                <p style={{ margin: '10px 0', fontSize: '13px', color: '#e53935' }}>
                  {reviewError}
                </p>
              )}

              {reviewSuccess && (
                <p style={{ margin: '10px 0', fontSize: '13px', color: '#16a34a' }}>
                  {reviewSuccess}
                </p>
              )}

              <p className={styles.termsText}>
                By submitting a review, you agree to our <a href='#' className={styles.termsLink}>Terms</a> & <a href='#' className={styles.termsLink}>Privacy Policy.</a>
              </p>

              <button
                className={styles.submitReviewBtn}
                onClick={handleReviewSubmit}
                disabled={reviewSubmitting}
              >
                {reviewSubmitting ? 'Uploading & Submitting...' : 'Submit Review'}
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
                <p className={styles.priceModalSubtitle}>Order ID # {order.orderId}</p>
              </div>
              <button className={styles.closeModalBtn} onClick={() => setShowPriceDetailsModal(false)} aria-label='Close modal'>
                <CloseIcon />
              </button>
            </div>

            <div className={styles.priceModalDivider} />

            <div className={styles.priceModalContent}>
              <div className={styles.priceBreakdownBox}>
                <div className={styles.priceBreakdownRow}>
                  <span>Item Subtotal ({order.allItems?.length || 1} item{order.allItems?.length > 1 ? 's' : ''})</span>
                  <span>₹{Number(order.subtotal).toFixed(2)}</span>
                </div>

                {order.discount > 0 && (
                  <div className={styles.priceBreakdownRow}>
                    <span>Discount</span>
                    <span style={{ color: '#16a34a' }}>-₹{Number(order.discount).toFixed(2)}</span>
                  </div>
                )}

                <div className={styles.priceDottedLine} />

                {order.shippingCharge > 0 ? (
                  <div className={styles.priceBreakdownRow}>
                    <span>Shipping / Delivery Fee</span>
                    <span>₹{Number(order.shippingCharge).toFixed(2)}</span>
                  </div>
                ) : (
                  <div className={styles.priceBreakdownRow}>
                    <span>Shipping</span>
                    <span style={{ color: '#16a34a' }}>FREE</span>
                  </div>
                )}

                <div className={styles.priceDottedLine} />

                <div className={styles.priceBreakdownRowBold}>
                  <span>Total Amount</span>
                  <span>₹{Number(order.totalPrice).toFixed(2)}</span>
                </div>

                <div className={styles.paidByBox}>
                  <span>Payment Method</span>
                  <span className={styles.paidByMethod}>{order.paymentMethod || 'Online'}</span>
                </div>

                <button
                  className={styles.downloadInvoiceBtn}
                  onClick={handleDownloadInvoice}
                  disabled={invoiceLoading}
                >
                  <DownloadIcon /> {invoiceLoading ? 'Downloading PDF...' : 'Download Invoice'}
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
