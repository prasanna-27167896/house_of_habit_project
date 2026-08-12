import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SlidePanel from '../../../../common/SlidePanel/SlidePanel';
import slidePanelStyles from '../../../../common/SlidePanel/SlidePanel.module.css';
import styles from './MobileCartPanel.module.css';
import CartItem from '../CartItem/CartItem';
import PriceDetails from '../PriceDetails/PriceDetails';
import Button from '../../../../common/Button/Button';
import { fetchCart, removeFromCart } from '../../../../../store/slices/cartSlice';
import { useEffect } from 'react';

import LogoIcon from '../../../../../assets/icons/hoh-logo.svg?react';
import CloseIcon from '../../../../../assets/icons/nav-mobile-close-icon.svg?react';
import MobileSlideHeader from '../../../../mobile-slide-header/MobileSlideHeader';


const MobileCartPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { items: cartItems, deletingItems = [] } = useSelector((state) => state.cart);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCart());
    }
  }, [isOpen, dispatch]);

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const isEmpty = !cartItems || cartItems.length === 0;
  const totalItems = cartItems ? cartItems.reduce((s, i) => s + i.quantity, 0) : 0;

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      className={styles.panel}
      overlayClassName={slidePanelStyles.mobileOnly}
      direction="up"
    >
      {({ animateClose }) => {
        const handleStartShopping = () => {
          animateClose(() => navigate('/shop/polo-t-shirts'));
        };

        const handleProceedToCheckout = () => {
          animateClose(() => {
            navigate('/checkout', { state: { backgroundLocation: location } });
          });
        };

        return (
          <>
            {/* ── Header: Logo + Close ── */}
            <MobileSlideHeader animateClose={animateClose} />

            {/* ── Title ── */}
            <h2 className={styles.title}>Cart ({totalItems} items)</h2>

            {isEmpty ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M 30 35 L 35 15 L 65 15 L 70 35 M 35 35 L 65 35 M 38 35 L 40 70 Q 40 75 45 75 L 55 75 Q 60 75 60 70 L 62 35' />
                  </svg>
                </div>
                <p className={styles.emptyMessage}>Your cart is waiting — add your favorite styles now.</p>
                <button className={styles.shopBtn} type='button' onClick={handleStartShopping}>
                  <Button bgColor={'#1e1e1e'} pillColor={'#ff5f15'} size='sm'>
                    Start Shopping
                  </Button>
                </button>
              </div>
            ) : (
              <>
                {/* ── Cart Items ── */}
                <div className={styles.body}>
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onRemove={handleRemoveItem}
                      isDeleting={deletingItems.includes(item.id)}
                    />
                  ))}
                </div>

                {/* ── Price Details + Pay ── */}
                <div className={styles.priceWrap}>
                  <PriceDetails items={cartItems} onPayment={handleProceedToCheckout} />
                </div>
              </>
            )}
          </>
        );
      }}
    </SlidePanel>
  );
};

export default MobileCartPanel;
