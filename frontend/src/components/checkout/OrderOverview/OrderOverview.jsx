import { useState } from 'react';
import styles from './OrderOverview.module.css';
import DummyImage from '../../../assets/images/dummy-model.png';

const OrderOverview = ({ onBack, onChangeAddress, addressData, totalPrice = 999, onPaymentSelect }) => {
  const displayAddress = addressData || {
    name: 'Siddu',
    addressLine1: '8/21 chandra layout vijayanagar, bangalore',
    addressLine2: 'karnataka, 560040',
    phone: '+91 9620099167',
    email: 'revanasiddappaarundi@gmail.com',
  };

  return (
    <div className={styles.wrapper}>
      {/* Product Summary Header */}
      <div className={styles.productHeader}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className={styles.productInfo}>
          <img src={DummyImage} alt="Solid Muscle Fit Polo shirt" className={styles.productImg} />
          <div className={styles.productMeta}>
            <h4 className={styles.productName}>Solid Muscle Fit Polo shirt</h4>
            <div className={styles.badgeRow}>
              <span className={styles.metaBadge}>S</span>
              <span className={styles.metaBadge}>1 item</span>
            </div>
          </div>
        </div>

        <div className={styles.priceMeta}>
          <span className={styles.originalPrice}>₹1,899.00</span>
          <span className={styles.actualPrice}>₹999.00</span>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className={styles.body} data-lenis-prevent>
        {/* Section 1: Delivery Details */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Delivery Details</h3>
          <div className={styles.card}>
            <div className={styles.addressRow}>
              <div className={styles.iconContainer}>
                {/* Pin Icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff5f15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className={styles.addressContent}>
                <h5 className={styles.recipientName}>Delivery to {displayAddress.name}</h5>
                <p className={styles.addressText}>{displayAddress.addressLine1}</p>
                <p className={styles.addressText}>{displayAddress.addressLine2}</p>
                <p className={styles.contactText}>
                  {displayAddress.phone}
                  {displayAddress.email && <span className={styles.separator}> | </span>}
                  {displayAddress.email}
                </p>
              </div>
              <button className={styles.changeBtn} onClick={onChangeAddress} type="button">
                Change
              </button>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.shippingRow}>
              <div className={styles.iconContainer}>
                {/* Shipping Truck Icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff5f15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <div className={styles.shippingContent}>
                <h5 className={styles.shippingTitle}>Shipping</h5>
                <span className={styles.freeBadge}>Free</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Offers */}
        {/* <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Offers</h3>
          <div className={styles.card}>
            <div className={styles.couponInputWrapper}>
              <svg className={styles.couponIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff5f15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5v2"></path>
                <path d="M15 11v2"></path>
                <path d="M15 17v2"></path>
                <path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"></path>
              </svg>
              <input
                type="text"
                className={styles.couponInput}
                placeholder="Enter Coupon Code"
                readOnly
              />
            </div>

            <div className={styles.couponFooter}>
              <div className={styles.leftCoupon}>
                <span className={styles.ticketBadge}>%</span>
                <span className={styles.couponCount}>9 coupons available</span>
              </div>
              <button className={styles.viewAllBtn} type="button">
                View all
              </button>
            </div>
          </div>
        </div> */}

        {/* Section 3: Payment Options */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Payment Option</h3>
          <div className={styles.paymentList}>
            {/* Button 1: Online Payment */}
            <button className={styles.paymentBtn} onClick={onPaymentSelect} type="button">
              <div className={styles.paymentLeft}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
                <span className={styles.paymentLabel}>Online Payment</span>
              </div>
              <div className={styles.paymentRight}>
                <span className={styles.paymentVal}>₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </button>

            {/* Button 2: Cash on Delivery with overlapping banner */}
            <div className={styles.codWrapper}>
              <div className={styles.codBanner}>
                ₹90 rs COD Charge Added
              </div>
              <button className={`${styles.paymentBtn} ${styles.codBtn}`} onClick={onPaymentSelect} type="button">
                <div className={styles.paymentLeft}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  <span className={styles.paymentLabel}>Cash on Delivery</span>
                </div>
                <div className={styles.paymentRight}>
                  <span className={styles.paymentVal}>₹{(totalPrice + 90).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderOverview;
