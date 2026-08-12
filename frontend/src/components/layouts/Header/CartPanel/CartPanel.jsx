import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './CartPanel.module.css';
import CartItem from './CartItem/CartItem';
import PriceDetails from './PriceDetails/PriceDetails';
import Button from '../../../common/Button/Button';
import { fetchCart, removeFromCart } from '../../../../store/slices/cartSlice';

const CartPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { items: cartItems, deletingItems = [] } = useSelector((state) => state.cart);
  const [isClosing, setIsClosing] = useState(false);


  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
      dispatch(fetchCart());
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, dispatch]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 600);
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleStartShopping = () => {
    setIsClosing(true);
    setTimeout(() => {
      navigate('/shop/polo-t-shirts');
      onClose();
    }, 600);
  };

  const handleProceedToCheckout = () => {
    setIsClosing(true);
    setTimeout(() => {
      navigate('/checkout', { state: { backgroundLocation: location } });
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  const isEmpty = cartItems.length === 0;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={`${styles.panel} ${isClosing ? styles.closing : ''}`}
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
              <Button bgColor={'#1e1e1e'} pillColor={'#ff5f15'} size='sm'>
                Start Shopping
              </Button>
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default CartPanel;
