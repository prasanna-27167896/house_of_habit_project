import styles from './OrderConfirmation.module.css';
import SuccessGif from '../../../assets/images/order-confirmation-success.gif';

const OrderConfirmation = ({ onContinueShopping, onTrackOrder, totalPrice = 999, orderData }) => {
  const displayOrderId = orderData?.orderId || 'ORD987654';

  const displayTime = orderData?.createdAt
    ? new Date(orderData.createdAt).toLocaleString('en-IN', { hour12: false })
    : new Date().toLocaleString('en-IN', { hour12: false });

  const displayMethod = orderData?.paymentMethod === 'COD'
    ? 'Cash on Delivery'
    : (orderData?.paymentMethod || 'Online Payment');

  const displayDate = orderData?.createdAt
    ? new Date(orderData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  const displayEst = orderData?.createdAt
    ? `${new Date(new Date(orderData.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit' })}-${new Date(new Date(orderData.createdAt).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`
    : `${new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit' })}-${new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`;

  const displayAmount = orderData?.totalAmount ?? totalPrice;

  return (
    <div className={styles.wrapper}>
      <div className={styles.body}>
        {/* Success Illustration Block */}
        <div className={styles.successBlock}>
          <img src={SuccessGif} alt="Order Successful" className={styles.successGif} />

          <h3 className={styles.title}>Your Order Is On Its Way</h3>
          <p className={styles.message}>
            {orderData?.paymentMethod === 'COD'
              ? 'Your COD order has been placed successfully. Pay cash on delivery.'
              : 'Payment successful. Your invoice and shipping updates will be sent to your email shortly.'}
          </p>
        </div>

        <div className={styles.divider}></div>

        {/* Order Details Table */}
        <div className={styles.detailsTable}>
          <div className={styles.row}>
            <span className={styles.label}>Order Number</span>
            <span className={styles.value}>{displayOrderId}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Payment Time</span>
            <span className={styles.value}>{displayTime}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Payment Method</span>
            <span className={styles.value}>{displayMethod}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Order Date</span>
            <span className={styles.value}>{displayDate}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Estimated Delivery</span>
            <span className={styles.value}>{displayEst}</span>
          </div>

          <div className={styles.dottedDivider}></div>

          <div className={`${styles.row} ${styles.amountRow}`}>
            <span className={styles.amountLabel}>Amount</span>
            <span className={styles.amountValue}>
              ₹{displayAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Appreciate Note */}
        <p className={styles.appreciateNote}>We appreciate your visit, see yo again!</p>
      </div>

      {/* Action Buttons Row */}
      <div className={styles.footerRow}>
        <button className={styles.trackBtn} onClick={onTrackOrder} type="button">
          Track Order
        </button>
        <button className={styles.continueBtn} onClick={onContinueShopping} type="button">
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
