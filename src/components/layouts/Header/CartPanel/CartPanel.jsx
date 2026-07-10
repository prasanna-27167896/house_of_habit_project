import { useState, useEffect } from 'react';
import styles from './CartPanel.module.css';
import CartItem from './CartItem/CartItem';
import PriceDetails from './PriceDetails/PriceDetails';
import { useNavigate } from 'react-router-dom';
import Button from '../../../common/Button/Button';

// Mock cart data
const MOCK_CART_ITEMS = [
  {
    id: 1,
    name: 'Solid Muscle Fit Polo shirt',
    image: 'https://via.placeholder.com/120x160?text=Polo+1',
    size: 'S',
    quantity: 1,
    price: 900,
    originalPrice: 999,
  },
  {
    id: 2,
    name: 'Solid Muscle Fit Polo shirt',
    image: 'https://via.placeholder.com/120x160?text=Polo+2',
    size: 'S',
    quantity: 1,
    price: 900,
    originalPrice: 999,
    discount: '20%',
  },
];

const CartPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 600);
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  const handleStartShopping = () => {
    setIsClosing(true);
    setTimeout(() => {
      navigate('/shop');
      onClose();
    }, 600);
  };

  const handlePayment = () => {
    setIsClosing(true);
    setTimeout(() => {
      navigate('/checkout');
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  const isEmpty = cartItems.length === 0;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={`${styles.panel} ${isClosing ? styles.closing : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose} aria-label='Close'>
          &#x2715;
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>Cart ({isEmpty ? 0 : cartItems.length})</h2>
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
          <div className={styles.content}>
            <div className={styles.itemsList}>
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} onRemove={handleRemoveItem} />
              ))}
            </div>
            <div className={styles.sidebar}>
              <PriceDetails items={cartItems} onPayment={handlePayment} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPanel;
