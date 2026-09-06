import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../../../pages/Account/ReturnItemPage.module.css';
import { normalizeOrder } from '../../../data/ordersData';
import { submitReturn } from '../../../store/slices/orderSlice';

/* ── Inline SVG Icons ── */
const ChevronUpIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='18 15 12 9 6 15' />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='6 9 12 15 18 9' />
  </svg>
);

/* ── Category Illustrations ── */
const SadFaceBannerIcon = () => (
  <svg width='52' height='52' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect width='48' height='48' rx='12' fill='#EAB308' />
    <path d='M16 20C17.1 20 18 19.1 18 18C18 16.9 17.1 16 16 16C14.9 16 14 16.9 14 18C14 19.1 14.9 20 16 20Z' fill='#FFFFFF' />
    <path d='M32 20C33.1 20 34 19.1 34 18C34 16.9 33.1 16 32 16C30.9 16 30 16.9 30 18C30 19.1 30.9 20 32 20Z' fill='#FFFFFF' />
    <path d='M16 30C18.5 27 29.5 27 32 30' stroke='#FFFFFF' strokeWidth='3' strokeLinecap='round' />
  </svg>
);

const QualityIllustration = () => (
  <svg width='44' height='44' viewBox='0 0 44 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect width='44' height='44' rx='10' fill='#FEF3C7' />
    <rect x='12' y='16' width='20' height='16' rx='4' fill='#F59E0B' />
    <path d='M16 16V14C16 11.79 17.79 10 20 10H24C26.21 10 28 11.79 28 14V16' stroke='#D97706' strokeWidth='2' />
    <circle cx='22' cy='24' r='3' fill='#FFFFFF' />
  </svg>
);

const ChangeMyMindIllustration = () => (
  <svg width='44' height='44' viewBox='0 0 44 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect width='44' height='44' rx='10' fill='#FCE7F3' />
    <circle cx='22' cy='16' r='6' fill='#EC4899' />
    <path d='M12 34C12 28.4772 16.4772 24 22 24C27.5228 24 32 28.4772 32 34H12Z' fill='#DB2777' />
    <circle cx='30' cy='14' r='4' fill='#F472B6' />
    <text x='28.5' y='16.5' fontSize='7' fontWeight='bold' fill='#FFFFFF'>?</text>
  </svg>
);

const SizeFitIllustration = () => (
  <svg width='44' height='44' viewBox='0 0 44 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect width='44' height='44' rx='10' fill='#F0F4FF' />
    <circle cx='22' cy='16' r='6' fill='#3B82F6' />
    <path d='M12 34C12 28.4772 16.4772 24 22 24C27.5228 24 32 28.4772 32 34H12Z' fill='#1D4ED8' />
    <path d='M16 28L22 22L28 28' stroke='#F59E0B' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
);

const DifferentProductIllustration = () => (
  <svg width='44' height='44' viewBox='0 0 44 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect width='44' height='44' rx='10' fill='#FFF3ED' />
    <path d='M14 20L22 15L30 20V32L22 37L14 32V20Z' fill='#FF5F15' />
    <path d='M22 15V37' stroke='#EA580C' strokeWidth='1.5' />
    <path d='M14 20L22 25L30 20' stroke='#EA580C' strokeWidth='1.5' />
  </svg>
);

const DamagedIllustration = () => (
  <svg width='44' height='44' viewBox='0 0 44 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect width='44' height='44' rx='10' fill='#E6FFFA' />
    <path d='M16 14L22 11L28 14V20C28 26 22 30 22 30C22 30 16 26 16 20V14Z' fill='#0D9488' />
    <path d='M20 18L24 22M24 18L20 22' stroke='#FFFFFF' strokeWidth='2' strokeLinecap='round' />
  </svg>
);

const RETURN_CATEGORIES = [
  {
    id: 'quality',
    title: 'Quality Issues',
    subtitle: 'Poor Quality Products',
    illustration: <QualityIllustration />,
    reasons: ['Received a poor quality product', 'Product image was better than the actual product'],
  },
  {
    id: 'change-mind',
    title: 'Change my mind',
    subtitle: "I don't want this product",
    illustration: <ChangeMyMindIllustration />,
    reasons: ["I don't want this product anymore", 'Found a better product elsewhere'],
  },
  {
    id: 'size-fit',
    title: 'Size & Fit Issues',
    subtitle: "Doesn't fit me well",
    illustration: <SizeFitIllustration />,
    reasons: ['Size too small', 'Size too big', 'I did not like the fit'],
  },
  {
    id: 'different',
    title: 'Different Product',
    subtitle: 'Not what i ordered',
    illustration: <DifferentProductIllustration />,
    reasons: ['Received a different product', 'Color is different from what I ordered'],
  },
  {
    id: 'damaged',
    title: 'Damaged/Used',
    subtitle: 'Not in good condition',
    illustration: <DamagedIllustration />,
    reasons: ['Product is damaged', 'Product seems to be used', 'Packaging was damaged'],
  },
];

const ReturnItemView = ({ orderId, onBack }) => {
  const dispatch = useDispatch();
  const { orders, currentOrder, actionLoading } = useSelector((state) => state.order);

  const [openCategory, setOpenCategory] = useState('quality');
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState('Quality Issues');
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

  const toggleCategory = (id, title) => {
    setOpenCategory((prev) => (prev === id ? null : id));
    if (title) setSelectedCategoryTitle(title);
  };

  const handleReturnSubmit = async () => {
    if (!selectedReason || actionLoading) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const firstItem = (rawOrder?.orderItems && rawOrder.orderItems[0]) || {};
    const orderItemId = product.orderItemId || firstItem.orderItemId || firstItem.id || order.id;

    try {
      await dispatch(
        submitReturn({
          orderId: order.id,
          orderItemId,
          reasonCategory: selectedCategoryTitle,
          reasonDetail: selectedReason,
          comment: comment || undefined,
        })
      ).unwrap();

      setSuccessMsg('Return request submitted successfully. Our courier partner will schedule pickup.');
      setTimeout(() => {
        onBack({ type: 'detail', orderId: order.id });
      }, 1800);
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : 'Failed to submit return request.');
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
            <p className={styles.productPrice}>₹ {Number(product.price).toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* ── Want to return banner ── */}
      <section className={styles.sectionNoBorder}>
        <div className={styles.returnPrompt}>
          <SadFaceBannerIcon />
          <h3 className={styles.returnTitle}>Want to return?</h3>
          <p className={styles.returnSub}>Don't worry, we are here to help you</p>
        </div>
      </section>

      {/* ── Select return reason ── */}
      <section className={styles.section}>
        <div className={styles.reasonSection}>
          <h3 className={styles.sectionTitle}>Select Return reason</h3>
          <p className={styles.sectionSub}>Please select correct reason for return to improve our service</p>

          <div className={styles.divider} />

          <div className={styles.categoryList}>
            {RETURN_CATEGORIES.map((cat) => (
              <div key={cat.id} className={styles.categoryCard}>
                <button
                  type='button'
                  className={styles.categoryHeader}
                  onClick={() => toggleCategory(cat.id, cat.title)}
                >
                  <div className={styles.categoryLeft}>
                    {cat.illustration}
                    <div>
                      <p className={styles.categoryTitle}>{cat.title}</p>
                      <p className={styles.categorySub}>{cat.subtitle}</p>
                    </div>
                  </div>
                  {openCategory === cat.id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </button>

                {openCategory === cat.id && (
                  <div className={styles.categoryBody}>
                    <div className={styles.innerDivider} />
                    {cat.reasons.map((reason) => (
                      <label key={reason} className={styles.reasonItem}>
                        <input
                          type='radio'
                          name='returnReason'
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={(e) => {
                            setSelectedReason(e.target.value);
                            setSelectedCategoryTitle(cat.title);
                          }}
                          className={styles.radio}
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px' }}>
            <textarea
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontFamily: 'inherit',
                fontSize: '14px',
                resize: 'vertical',
                outline: 'none',
              }}
              placeholder='Additional comments (optional)...'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {errorMsg && (
            <p style={{ color: '#e53935', fontSize: '13px', margin: '10px 0' }}>
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p style={{ color: '#16a34a', fontSize: '13px', margin: '10px 0' }}>
              {successMsg}
            </p>
          )}
        </div>
      </section>

      {/* ── Continue button ── */}
      <div className={styles.continueRow}>
        <button
          type='button'
          className={styles.continueBtn}
          disabled={!selectedReason || actionLoading || successMsg}
          onClick={handleReturnSubmit}
        >
          {actionLoading ? 'Submitting...' : 'Submit Return Request'}
        </button>
      </div>
    </div>
  );
};

export default ReturnItemView;
