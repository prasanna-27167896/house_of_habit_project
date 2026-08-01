import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CheckoutModal.module.css';
import QuantitySelector from '../../cart/QuantitySelector/QuantitySelector';
import DeleteIcon from '../../../assets/icons/delete-icon-cart.svg?react';
import DummyImage from '../../../assets/images/dummy-model.png';
import { lenis } from '../../../utils/lenis';
import SlideUpPanel from '../SlideUpPanel/SlideUpPanel';
import SelectAddress from '../SelectAddress/SelectAddress';
import AddAddress from '../AddAddress/AddAddress';
import Loading from '../Loading/Loading';
import FillAddress from '../FillAddress/FillAddress';
import OrderOverview from '../OrderOverview/OrderOverview';
import OrderConfirmation from '../OrderConfirmation/OrderConfirmation';

const CheckoutModal = () => {
  const navigate = useNavigate();
  // panelView: null | 'select' | 'add' | 'loading' | 'fill'
  const [panelView, setPanelView] = useState(null);
  const [enteredPincode, setEnteredPincode] = useState('560040');
  const [addressData, setAddressData] = useState(null);

  useEffect(() => {
    if (panelView === 'loading') {
      const timer = setTimeout(() => {
        setPanelView('fill');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [panelView]);

  // Local state initialized with mockup data matching the reference image exactly
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Solid Muscle Fit Polo shirt',
      image: DummyImage,
      size: 'S',
      quantity: 1,
      price: 999,
      originalPrice: 1899,
      discount: 47,
    },
    {
      id: 2,
      name: 'Solid Muscle Fit Polo shirt',
      image: DummyImage,
      size: 'S',
      quantity: 1,
      price: 999,
      originalPrice: 1899,
      discount: 47,
    },
    {
      id: 2,
      name: 'Solid Muscle Fit Polo shirt',
      image: DummyImage,
      size: 'S',
      quantity: 1,
      price: 999,
      originalPrice: 1899,
      discount: 47,
    }
  ]);



  const handleClose = () => {
    navigate(-1); // Go back
  };

  const handleQuantityChange = (itemId, newQty) => {
    if (newQty < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleSizeChange = (itemId, newSize) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, size: newSize } : item
      )
    );
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // To match the mockup image exactly:
  // When quantity is 1, totalSavings is 1600.00. We scale it with quantity.
  const totalSavings = cartItems.reduce((sum, item) => sum + 1600 * item.quantity, 0);

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} data-lenis-prevent onClick={(e) => e.stopPropagation()}>
        {panelView === 'overview' ? (
          <OrderOverview 
            addressData={addressData}
            onBack={() => setPanelView('fill')}
            onChangeAddress={() => setPanelView('select')}
            totalPrice={totalPrice}
            onPaymentSelect={() => setPanelView('confirmation')}
          />
        ) : panelView === 'confirmation' ? (
          <OrderConfirmation 
            totalPrice={totalPrice}
            onContinueShopping={handleClose}
            onTrackOrder={() => console.log('Track order clicked')}
          />
        ) : (
          <>
            {/* Header */}
            <div className={styles.header}>
              <h2 className={styles.title}>Your Cart ({totalQuantity} items)</h2>
              <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
                &#x2715;
              </button>
            </div>

            {/* Scrollable Content */}
            <div className={styles.body}>
              {cartItems.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <div className={styles.scrollableContent}>
                  {/* Product Cards List */}
                  <div className={styles.itemsList}>
                    {cartItems.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemoveItem}
                        onSizeChange={handleSizeChange}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky/Bottom Footer */}
            {cartItems.length > 0 && (
              <div className={styles.footer}>
                {/* Savings badge */}
                {totalSavings > 0 && (
                  <div className={styles.savingsBadge}>
                    ₹{totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Saved so far!
                  </div>
                )}

                {/* Order Summary */}
                <div className={styles.summarySection}>
                  <h3 className={styles.summaryTitle}>Order Summery</h3>

                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Total</span>

                    <span className={styles.totalValue}>
                      ₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>

                  </div>

                  <button
                    className={styles.checkoutBtn}
                    onClick={() => setPanelView('select')}
                    type="button"
                  >
                    Proceed to Check Out
                  </button>
                </div>
              </div>
            )}
            <SlideUpPanel
              isOpen={panelView !== null && panelView !== 'overview' && panelView !== 'confirmation'}
              onClose={() => {
                if (panelView === 'fill') {
                  setPanelView('add');
                } else if (panelView === 'loading') {
                  setPanelView('add');
                } else if (panelView === 'add') {
                  setPanelView('select');
                } else {
                  setPanelView(null);
                }
              }}
            >
              {panelView === 'select' && (
                <SelectAddress
                  onAddNew={() => setPanelView('add')}
                  onContinue={(selectedAddress) => {
                    console.log('Selected address:', selectedAddress);
                    setAddressData(selectedAddress);
                    setPanelView('overview');
                  }}
                />
              )}
              {panelView === 'add' && (
                <AddAddress onContinue={(pincode) => {
                  console.log('Add address pincode continue clicked:', pincode);
                  setEnteredPincode(pincode);
                  setPanelView('loading');
                }} />
              )}
              {panelView === 'loading' && (
                <Loading title="Add Delivery Address" message="Please Wait..." />
              )}
              {panelView === 'fill' && (
                <FillAddress 
                  initialPincode={enteredPincode}
                  onContinue={(address) => {
                    console.log('Address form submitted:', address);
                    setAddressData(address);
                    setPanelView('overview');
                  }} 
                />
              )}
            </SlideUpPanel>
          </>
        )}
      </div>
    </div>
  );
};

const ProductCard = ({ item, onQuantityChange, onRemove, onSizeChange }) => {
  return (
    <div className={styles.productCard}>
      <div className={styles.imageWrapper}>
        <img src={item.image} alt={item.name} className={styles.productImage} />
      </div>

      <div className={styles.productDetails}>
        <h3 className={styles.productName}>{item.name}</h3>

        <div className={styles.sizeDropdownWrapper}>
          <select
            value={item.size}
            onChange={(e) => onSizeChange(item.id, e.target.value)}
            className={styles.sizeSelect}
          >
            {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className={styles.actionsRow}>
          <QuantitySelector
            quantity={item.quantity}
            onIncrement={() => onQuantityChange(item.id, item.quantity + 1)}
            onDecrement={() => onQuantityChange(item.id, item.quantity - 1)}
          />

          <button
            className={styles.deleteBtn}
            onClick={() => onRemove(item.id)}
            aria-label="Remove item"
          >
            <DeleteIcon className={styles.deleteIcon} />
          </button>
        </div>
      </div>

      <div className={styles.pricingSection}>
        {item.originalPrice > item.price && (
          <span className={styles.originalPrice}>
            ₹{item.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        )}
        <span className={styles.salePrice}>
          ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
        {item.discount > 0 && (
          <span className={styles.discountBadge}>
            ({item.discount}% Off)
          </span>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
