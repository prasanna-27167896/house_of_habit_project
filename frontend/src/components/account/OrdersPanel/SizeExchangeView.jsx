import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../../../pages/Account/SizeExchangePage.module.css';
import { normalizeOrder } from '../../../data/ordersData';
import { submitExchange } from '../../../store/slices/orderSlice';

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

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const EXCHANGE_CATEGORIES = [
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
    reasons: ['Product is damaged', 'Product seems to be used'],
  },
];

const SizeExchangeView = ({ orderId, onBack }) => {
  const dispatch = useDispatch();
  const { orders, currentOrder, actionLoading } = useSelector((state) => state.order);

  const [selectedSize, setSelectedSize] = useState('');
  const [openCategory, setOpenCategory] = useState('size-fit');
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState('Size & Fit Issues');
  const [selectedReason, setSelectedReason] = useState('');
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

  const handleExchangeSubmit = async () => {
    if (!selectedSize || !selectedReason || actionLoading) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const firstItem = (rawOrder?.orderItems && rawOrder.orderItems[0]) || {};
    const orderItemId = product.orderItemId || firstItem.orderItemId || firstItem.id || order.id;

    try {
      await dispatch(
        submitExchange({
          orderId: order.id,
          orderItemId,
          requestedSize: selectedSize,
          reasonCategory: selectedCategoryTitle,
          reasonDetail: selectedReason,
        })
      ).unwrap();

      setSuccessMsg(`Exchange request for size ${selectedSize} submitted successfully.`);
      setTimeout(() => {
        onBack({ type: 'detail', orderId: order.id });
      }, 1800);
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : 'Failed to submit size exchange request.');
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
            <p className={styles.productMeta}>Current Size: {product.size}</p>
            <p className={styles.productPrice}>₹ {Number(product.price).toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* ── Select replacement size ── */}
      <section className={styles.section}>
        <div className={styles.sizeSection}>
          <h3 className={styles.sectionTitle}>Select Replacement Size</h3>
          <p className={styles.originalSize}>Original Size: {product.size}</p>

          <div className={styles.sizeGrid}>
            {SIZES.map((size) => (
              <button
                key={size}
                type='button'
                className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeActive : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why are you exchanging ── */}
      <section className={styles.section}>
        <div className={styles.reasonSection}>
          <h3 className={styles.sectionTitle}>Why are you exchanging</h3>
          <p className={styles.sectionSub}>Please select correct reason for exchange to improve our service</p>

          <div className={styles.divider} />

          <div className={styles.categoryList}>
            {EXCHANGE_CATEGORIES.map((cat) => (
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
                          name='exchangeReason'
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
          disabled={!selectedSize || !selectedReason || actionLoading || successMsg}
          onClick={handleExchangeSubmit}
        >
          {actionLoading ? 'Submitting...' : 'Submit Exchange Request'}
        </button>
      </div>
    </div>
  );
};

export default SizeExchangeView;
