import { useState } from 'react';
import styles from '../../../pages/Account/SizeExchangePage.module.css';
import { mockOrders } from '../../../data/ordersData';

/* ── Inline SVG Icons ── */
const BackIcon = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='15 18 9 12 15 6' />
  </svg>
);

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

const SIZES = ['S', 'M', 'L', 'XL'];

const EXCHANGE_CATEGORIES = [
  {
    id: 'size-fit',
    title: 'Size & Fit Issues',
    subtitle: "Doesn't fit me well",
    emoji: '👤',
    reasons: ['Size too small', 'Size too big', 'I did not like the fit'],
  },
  {
    id: 'different',
    title: 'Different Product',
    subtitle: 'Not what i ordered',
    emoji: '📦',
    reasons: ['Received a different product', 'Color is different from what I ordered'],
  },
  {
    id: 'damaged',
    title: 'Damaged/Used',
    subtitle: 'Not in good condition',
    emoji: '🧳',
    reasons: ['Product is damaged', 'Product seems to be used'],
  },
];

const SizeExchangeView = ({ orderId, onBack }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [openCategory, setOpenCategory] = useState('size-fit');
  const [selectedReason, setSelectedReason] = useState('');

  const order = mockOrders.find((o) => o.id === Number(orderId));

  if (!order) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.notFound}>Order not found.</p>
      </div>
    );
  }

  const { product } = order;

  const toggleCategory = (id) => {
    setOpenCategory((prev) => (prev === id ? null : id));
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
            <p className={styles.productPrice}>₹ {product.price}</p>
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
                className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeActive : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>

          <p className={styles.deliveryEstimate}>Delivery By on <strong>Mon, 11 May</strong></p>
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
                <button className={styles.categoryHeader} onClick={() => toggleCategory(cat.id)}>
                  <div className={styles.categoryLeft}>
                    <span className={styles.categoryEmoji}>{cat.emoji}</span>
                    <div>
                      <p className={styles.categoryTitle}>{cat.title}</p>
                      <p className={styles.categorySub}>{cat.subtitle}</p>
                    </div>
                  </div>
                  {openCategory === cat.id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </button>

                {openCategory === cat.id && (
                  <div className={styles.categoryBody}>
                    {cat.reasons.map((reason) => (
                      <label key={reason} className={styles.reasonItem}>
                        <input
                          type='radio'
                          name='exchangeReason'
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={(e) => setSelectedReason(e.target.value)}
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
        </div>
      </section>

      {/* ── Continue button ── */}
      <div className={styles.continueRow}>
        <button className={styles.continueBtn} disabled={!selectedSize || !selectedReason}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default SizeExchangeView;
