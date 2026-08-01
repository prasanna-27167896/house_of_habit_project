import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './CartPanel.module.css';
import CartItem from './CartItem/CartItem';
import PriceDetails from './PriceDetails/PriceDetails';
import CartDrawerItem from '../../../cart/CartDrawerItem/CartDrawerItem';
import CouponSection from '../../../cart/CouponSection/CouponSection';
import SavingsBadge from '../../../cart/SavingsBadge/SavingsBadge';
import OrderSummary from '../../../cart/OrderSummary/OrderSummary';
import Button from '../../../common/Button/Button';
import { lenis } from '../../../../utils/lenis';
import { fetchCart, removeFromCart, updateCartItem } from '../../../../store/slices/cartSlice';

const CartPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: cartItems, deletingItems = [] } = useSelector((state) => state.cart);
  const [isClosing, setIsClosing] = useState(false);


  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
      setIsClosing(false);
      dispatch(fetchCart());
    } else {
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }
    return () => {
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    };
  }, [isOpen, dispatch]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 600);
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleQuantityChange = (itemId, newQty) => {
    if (newQty < 1) return;
    dispatch(updateCartItem({ cartItemId: itemId, quantity: newQty }));
  };

  const handleStartShopping = () => {
    setIsClosing(true);
    setTimeout(() => {
      navigate('/shop/polo-t-shirts');
      onClose();
    }, 600);
  };

  const handleProceedToCheckout = () => {
    console.log('Checkout flow is currently disabled');
  };

  if (!isOpen) return null;

  const isEmpty = cartItems.length === 0;
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalOriginal = cartItems.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
  const totalSavings = totalOriginal - totalPrice;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={`${styles.panel} ${isClosing ? styles.closing : ''}`}
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={handleClose} aria-label='Close'>
          &#x2715;
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>Your Cart ({isEmpty ? 0 : cartItems.reduce((s, i) => s + i.quantity, 0)} items)</h2>
        </div>

        {isEmpty ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='currentColor' strokeWidth='2'>
                <path d='M 30 35 L 35 15 L 65 15 L 70 35 M 35 35 L 65 35 M 38 35 L 40 70 Q 40 75 45 75 L 55 75 Q 60 75 60 70 L 62 35' />
              </svg>
            </div>
            <p className={styles.emptyMessage}>Your cart is waiting — add your favorite styles now.</p>

            <button className={styles.buyButton} type='button' onClick={handleStartShopping}>
              <Button variant='light' size='sm'>
                Start Shopping
              </Button>
            </button>
          </div>
        ) : (
          <>
            {/* ── Desktop Layout ── */}
            <div className={styles.content}>
              <div className={styles.itemsList}>
                {cartItems.map((item) => (
                  <CartItem 
                    key={item.id} 
                    item={item} 
                    onRemove={handleRemoveItem} 
                    isDeleting={deletingItems.includes(item.id)}
                  />
                ))}
              </div>
              <div className={styles.sidebar}>
                <PriceDetails items={cartItems} onPayment={handleProceedToCheckout} />
              </div>
            </div>

            {/* ── Mobile Layout ── */}
            <div className={styles.mobileContent}>
              <div className={styles.mobileItemsList}>
                {cartItems.map((item) => (
                  <CartDrawerItem
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                    isDeleting={deletingItems.includes(item.id)}
                  />
                ))}
              </div>

              <CouponSection variant="drawer" />

              <div className={styles.mobileBottom}>
                <SavingsBadge amount={totalSavings} />
                <OrderSummary total={totalPrice} onProceed={handleProceedToCheckout} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPanel;
