import { useState } from 'react';
import styles from './OrderOverview.module.css';
import DummyImage from '../../../assets/images/dummy-model.png';
import LocationIcon from '../../../assets/icons/location-icon.svg?react';
import ShippingIcon from '../../../assets/icons/shipping-icon.svg?react';
import OnlinePayIcon from '../../../assets/icons/online-pay-icon.svg?react';
import CodPayIcon from '../../../assets/icons/cod-pay-icon.svg?react';
import { 
  initiatePayment, 
  verifyPayment, 
  placeCODOrder, 
  getPaymentStatus, 
  initiatePaymentSingle, 
  placeCODOrderSingle 
} from '../../../services/paymentService';
import { addToCart as apiAddToCart } from '../../../services/cartService';
import loaderStyles from '../../common/Loader/Loader.module.css';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const OrderOverview = ({ onBack, onChangeAddress, addressData, totalPrice = 999, buyNowItem, cartItems = [], onPaymentSelect }) => {
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [codLoading, setCodLoading] = useState(false);
  const [error, setError] = useState(null);

  const loading = onlineLoading || codLoading;

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalOriginalPrice = cartItems.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);

  let headerImage = DummyImage;
  let headerName = 'Polo Shirts';
  let headerSize = 'S';
  const headerQtyLabel = `${totalQuantity} item${totalQuantity > 1 ? 's' : ''}`;

  if (cartItems.length === 1) {
    const item = cartItems[0];
    headerImage = item.image || DummyImage;
    headerName = item.name || item.title || 'Solid Muscle Fit Polo shirt';
    headerSize = item.size || 'S';
  } else if (cartItems.length > 1) {
    const firstItem = cartItems[0];
    headerImage = firstItem.image || DummyImage;
    headerName = `${firstItem.name || firstItem.title || 'Polo Shirt'} & ${cartItems.length - 1} other item${cartItems.length - 1 > 1 ? 's' : ''}`;
    headerSize = 'Multi';
  }

  const pollPaymentStatus = (orderId) => {
    let attempts = 0;
    const maxAttempts = 15;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const statusRes = await getPaymentStatus(orderId);
        const currentStatus = statusRes.paymentStatus || statusRes.status;
        
        if (currentStatus === 'COMPLETED' || currentStatus === 'PROCESSING') {
          clearInterval(interval);
          if (onPaymentSelect) {
            onPaymentSelect({
              orderId: orderId,
              paymentMethod: statusRes.paymentMethod || 'RAZORPAY',
              createdAt: statusRes.createdAt || new Date().toISOString(),
              totalAmount: statusRes.totalAmount || totalPrice
            });
          }
          setOnlineLoading(false);
        } else if (currentStatus === 'FAILED' || attempts >= maxAttempts) {
          clearInterval(interval);
          throw new Error('Payment status verification failed or timed out.');
        }
      } catch (err) {
        clearInterval(interval);
        const errorMsg = err.response?.data?.message || err.message || 'Verification polling failed.';
        setError(errorMsg);
        setOnlineLoading(false);
      }
    }, 2500);
  };

  const handleOnlinePayment = async () => {
    if (loading) return;
    setError(null);
    setOnlineLoading(true);

    try {
      // 1. Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay payment SDK. Check your internet connection.');
      }

      // 2. Resolve target addressId to check if it's a valid UUID
      const isUUID = (str) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
      };

      const requestPayload = {};
      if (addressData && isUUID(addressData.addressId)) {
        requestPayload.addressId = addressData.addressId;
      } else if (addressData && isUUID(addressData.id)) {
        requestPayload.addressId = addressData.id;
      }

      let rzpOrderData;
      
      if (buyNowItem) {
        // Create the cart item database record immediately prior to online checkout initiation
        console.log('Buy Now flow: Adding item to cart behind the scenes...', buyNowItem);
        const addedItem = await apiAddToCart(buyNowItem.variantId, buyNowItem.quantity);
        const cartItemId = addedItem.data?.cartItemId || addedItem.data?.id || addedItem.cartItemId || addedItem.id;
        
        if (!cartItemId) {
          throw new Error('Failed to prepare item for checkout.');
        }
        
        rzpOrderData = await initiatePaymentSingle(cartItemId, requestPayload);
      } else {
        rzpOrderData = await initiatePayment(requestPayload);
      }

      // 4. Open Razorpay payment checkout options
      const options = {
        key: rzpOrderData.keyId,
        amount: rzpOrderData.amount,
        currency: rzpOrderData.currency,
        name: 'House of Habit',
        description: 'Polo T-Shirt Order',
        order_id: rzpOrderData.razorpayOrderId,
        prefill: {
          name: addressData?.name || addressData?.fullName || '',
          contact: addressData?.phone || '',
          email: addressData?.email || '',
        },
        theme: {
          color: '#ff5f15',
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setOnlineLoading(false);
          }
        },
        handler: async (response) => {
          console.log('Razorpay payment response received:', response);
          setError(null);
          setOnlineLoading(true);
          try {
            // Verify payment signature on backend
            const verifyPayload = {
              orderId: rzpOrderData.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            };

            const verifyResult = await verifyPayment(verifyPayload);

            if (verifyResult.status === 'CONFIRMED') {
              if (onPaymentSelect) {
                const confirmedOrder = verifyResult.order || {};
                onPaymentSelect({
                  orderId: confirmedOrder.orderId || rzpOrderData.orderId,
                  paymentMethod: confirmedOrder.paymentMethod || 'RAZORPAY',
                  createdAt: confirmedOrder.createdAt || new Date().toISOString(),
                  totalAmount: confirmedOrder.totalAmount || totalPrice
                });
              }
              setOnlineLoading(false);
            } else if (verifyResult.status === 'PENDING_WEBHOOK') {
              pollPaymentStatus(rzpOrderData.orderId);
            } else {
              throw new Error('Payment verification status unknown.');
            }
          } catch (err) {
            console.error('Signature verification error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Payment verification failed. Please contact support.';
            setError(errorMsg);
            setOnlineLoading(false);
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (err) {
      console.error('Payment initiation error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Something went wrong during payment initiation.';
      setError(errorMsg);
      setOnlineLoading(false);
    }
  };

  const handleCODOrder = async () => {
    if (loading) return;
    setError(null);
    setCodLoading(true);

    try {
      const isUUID = (str) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
      };

      const requestPayload = {};
      if (addressData && isUUID(addressData.addressId)) {
        requestPayload.addressId = addressData.addressId;
      } else if (addressData && isUUID(addressData.id)) {
        requestPayload.addressId = addressData.id;
      }

      let codOrder;
      
      if (buyNowItem) {
        // Create the cart item database record immediately prior to COD checkout placement
        console.log('Buy Now flow: Adding item to cart behind the scenes...', buyNowItem);
        const addedItem = await apiAddToCart(buyNowItem.variantId, buyNowItem.quantity);
        const cartItemId = addedItem.data?.cartItemId || addedItem.data?.id || addedItem.cartItemId || addedItem.id;
        
        if (!cartItemId) {
          throw new Error('Failed to prepare item for checkout.');
        }

        codOrder = await placeCODOrderSingle(cartItemId, requestPayload);
      } else {
        codOrder = await placeCODOrder(requestPayload);
      }
      
      if (onPaymentSelect) {
        onPaymentSelect({
          orderId: codOrder.orderId || codOrder.id,
          paymentMethod: codOrder.paymentMethod || 'COD',
          createdAt: codOrder.createdAt || new Date().toISOString(),
          totalAmount: codOrder.totalAmount || (totalPrice + 90)
        });
      }
      setCodLoading(false);
    } catch (err) {
      console.error('COD order creation error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Something went wrong while placing Cash on Delivery order.';
      setError(errorMsg);
      setCodLoading(false);
    }
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
          <img src={headerImage} alt={headerName} className={styles.productImg} />
          <div className={styles.productMeta}>
            <h4 className={styles.productName}>{headerName}</h4>
            <div className={styles.badgeRow}>
              <span className={styles.metaBadge}>{headerSize}</span>
              <span className={styles.metaBadge}>{headerQtyLabel}</span>
            </div>
          </div>
        </div>

        <div className={styles.priceMeta}>
          {totalOriginalPrice > totalPrice && (
            <span className={styles.originalPrice}>₹{totalOriginalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          )}
          <span className={styles.actualPrice}>₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className={styles.body} data-lenis-prevent>
        {/* Section 1: Delivery Details */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Delivery Details</h3>
          <div className={styles.card}>
            <div className={styles.addressRow}>
              {!addressData ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '1rem' }}>
                  <span className={loaderStyles.loader} style={{ width: '24px', height: '24px', borderWidth: '2px' }} aria-label="Loading"></span>
                </div>
              ) : (
                <>
                  <div className={styles.iconContainer}>
                    <LocationIcon width="24" height="24" />
                  </div>
                  <div className={styles.addressContent}>
                    <h5 className={styles.recipientName}>Delivery to {addressData.name || addressData.fullName}</h5>
                    <p className={styles.addressText}>{addressData.addressLine1}</p>
                    <p className={styles.addressText}>{addressData.addressLine2 || `${addressData.city}, ${addressData.state} ${addressData.pincode}`}</p>
                    <p className={styles.contactText}>
                      {addressData.phone}
                      {addressData.email && <span className={styles.separator}> | </span>}
                      {addressData.email}
                    </p>
                  </div>
                  <button className={styles.changeBtn} onClick={onChangeAddress} type="button">
                    Change
                  </button>
                </>
              )}
            </div>

            <div className={styles.divider}></div>

            <div className={styles.shippingRow}>
              <div className={styles.iconContainer}>
                <ShippingIcon width="24" height="24" />
              </div>
              <div className={styles.shippingContent}>
                <h5 className={styles.shippingTitle}>Shipping</h5>
                <span className={styles.freeBadge}>Free</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Payment Options */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Payment Option</h3>
          <div className={styles.paymentList}>
            {error && (
              <div className={styles.errorAlert}>
                {error}
              </div>
            )}

            {/* Button 1: Online Payment */}
            <button 
              className={styles.paymentBtn} 
              onClick={handleOnlinePayment} 
              disabled={loading || !addressData}
              type="button"
            >
              {onlineLoading ? (
                <span className={styles.paymentLabel} style={{ opacity: 0.8 }}>Processing Payment...</span>
              ) : (
                <>
                  <div className={styles.paymentLeft}>
                    <OnlinePayIcon width="24" height="24" />
                    <span className={styles.paymentLabel}>Online Payment</span>
                  </div>
                  <div className={styles.paymentRight}>
                    <span className={styles.paymentVal}>₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </>
              )}
            </button>

            {/* Button 2: Cash on Delivery with overlapping banner */}
            <div className={styles.codWrapper}>
              <div className={styles.codBanner}>
                ₹90 rs COD Charge Added
              </div>
              <button 
                className={`${styles.paymentBtn} ${styles.codBtn}`} 
                onClick={handleCODOrder} 
                disabled={loading || !addressData}
                type="button"
              >
                {codLoading ? (
                  <span className={styles.paymentLabel} style={{ opacity: 0.8 }}>Placing COD Order...</span>
                ) : (
                  <>
                    <div className={styles.paymentLeft}>
                      <CodPayIcon width="24" height="24" />
                      <span className={styles.paymentLabel}>Cash on Delivery</span>
                    </div>
                    <div className={styles.paymentRight}>
                      <span className={styles.paymentVal}>₹{(totalPrice + 90).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderOverview;
