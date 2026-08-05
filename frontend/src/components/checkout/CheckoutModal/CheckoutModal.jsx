import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styles from './CheckoutModal.module.css';
import QuantitySelector from '../../cart/QuantitySelector/QuantitySelector';
import DeleteIcon from '../../../assets/icons/delete-icon-cart.svg?react';
import DummyImage from '../../../assets/images/dummy-model.png';
import { lenis } from '../../../utils/lenis';
import SlideUpPanel from '../SlideUpPanel/SlideUpPanel';
import SelectAddress from '../SelectAddress/SelectAddress';
import AddAddress from '../AddAddress/AddAddress';
import FillAddress from '../FillAddress/FillAddress';
import OrderOverview from '../OrderOverview/OrderOverview';
import OrderConfirmation from '../OrderConfirmation/OrderConfirmation';
import Loading from '../Loading/Loading';
import * as addressService from '../../../services/addressService';
import { fetchCart, updateCartItem, removeFromCart } from '../../../store/slices/cartSlice';
import loaderStyles from '../../common/Loader/Loader.module.css';

const CheckoutModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Parse Buy Now mode indicators
  const initialBuyNowItem = location.state?.buyNowItem;
  const [localBuyNowItem, setLocalBuyNowItem] = useState(initialBuyNowItem || null);

  // panelView: null | 'select' | 'add' | 'fill' | 'loading'
  const [panelView, setPanelView] = useState(null);
  const [enteredPincode, setEnteredPincode] = useState('560040');
  const [addressData, setAddressData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);

  // Loading screen states
  const [targetView, setTargetView] = useState(null);
  const [loadingTitle, setLoadingTitle] = useState('Please Wait...');
  const [loadingMessage, setLoadingMessage] = useState('Processing...');

  // State to track which item is currently calling API update/delete
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // Sync cart items from store on checkout start (only if not in Buy Now flow)
  useEffect(() => {
    if (!initialBuyNowItem) {
      dispatch(fetchCart());
    }

    // Pre-load default address from database on mount if it exists
    const fetchDefaultAddress = async () => {
      try {
        const list = await addressService.getAddresses();
        if (list && list.length > 0) {
          const defaultAddr = list.find(a => a.isDefault) || list[0];
          setAddressData({
            ...defaultAddr,
            addressId: defaultAddr.addressId || defaultAddr.id,
            name: defaultAddr.fullName
          });
        }
      } catch (err) {
        console.error('Failed to pre-fetch default address:', err);
      }
    };
    fetchDefaultAddress();
  }, [dispatch, initialBuyNowItem]);

  const dbCartItems = useSelector((state) => state.cart.items) || [];

  // Filter items in Buy Now mode or full cart checkout
  const cartItems = initialBuyNowItem
    ? (localBuyNowItem ? [localBuyNowItem] : [])
    : dbCartItems;

  // Handles transitional loading screens before rendering next view
  useEffect(() => {
    if (panelView === 'loading' && targetView) {
      const timer = setTimeout(() => {
        setPanelView(targetView);
        setTargetView(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [panelView, targetView]);

  const handleClose = () => {
    navigate(-1); // Go back
  };

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    if (initialBuyNowItem) {
      setLocalBuyNowItem(prev => ({ ...prev, quantity: newQty }));
    } else {
      setUpdatingItemId(itemId);
      try {
        await dispatch(updateCartItem({ cartItemId: itemId, quantity: newQty })).unwrap();
      } catch (err) {
        console.error('Failed to update cart item quantity:', err);
      } finally {
        setUpdatingItemId(null);
      }
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (initialBuyNowItem) {
      setLocalBuyNowItem(null);
    } else {
      setUpdatingItemId(itemId);
      try {
        await dispatch(removeFromCart(itemId)).unwrap();
      } catch (err) {
        console.error('Failed to remove cart item:', err);
      } finally {
        setUpdatingItemId(null);
      }
    }
  };

  const handleSizeChange = (itemId, newSize) => {
    if (initialBuyNowItem) {
      setLocalBuyNowItem(prev => ({ ...prev, size: newSize }));
    } else {
      console.log('Size changes locally inside checkout popup context:', itemId, newSize);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalSavings = cartItems.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0);

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} data-lenis-prevent onClick={(e) => e.stopPropagation()}>
        {panelView === 'overview' ? (
          <OrderOverview
            addressData={addressData}
            onBack={() => setPanelView('select')}
            onChangeAddress={() => setPanelView('select')}
            totalPrice={totalPrice}
            buyNowItem={localBuyNowItem}
            cartItems={cartItems}
            onPaymentSelect={(confirmedOrder) => {
              setOrderData(confirmedOrder);
              setPanelView('confirmation');
            }}
          />
        ) : panelView === 'confirmation' ? (
          <OrderConfirmation
            totalPrice={totalPrice}
            orderData={orderData}
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
                        isUpdating={updatingItemId === item.id}
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
                  if (editingAddress) {
                    setPanelView('select');
                    setEditingAddress(null);
                  } else {
                    setPanelView('add');
                  }
                } else if (panelView === 'add') {
                  setPanelView('select');
                } else {
                  setPanelView(null);
                  setEditingAddress(null);
                }
              }}
            >
              {panelView === 'select' && (
                <SelectAddress
                  onAddNew={() => setPanelView('add')}
                  onEdit={(address) => {
                    setEditingAddress(address);
                    setPanelView('fill');
                  }}
                  onContinue={(selectedAddress) => {
                    console.log('Selected address:', selectedAddress);
                    setAddressData(selectedAddress);
                    setLoadingTitle('Select Delivery Address');
                    setLoadingMessage('Please Wait...');
                    setTargetView('overview');
                    setPanelView('loading');
                  }}
                />
              )}
              {panelView === 'add' && (
                <AddAddress onContinue={(pincode) => {
                  console.log('Add address pincode continue clicked:', pincode);
                  setEnteredPincode(pincode);
                  setLoadingTitle('Add Delivery Address');
                  setLoadingMessage('Please Wait...');
                  setTargetView('fill');
                  setPanelView('loading');
                }} />
              )}
              {panelView === 'loading' && (
                <Loading title={loadingTitle} message={loadingMessage} />
              )}
              {panelView === 'fill' && (
                <FillAddress
                  initialAddress={editingAddress}
                  initialPincode={enteredPincode}
                  onContinue={async (address) => {
                    console.log('Address form submitted:', address);
                    const isEdit = !!editingAddress;
                    setLoadingTitle('Saving Delivery Address');
                    setLoadingMessage('Please Wait...');
                    setPanelView('loading');
                    
                    try {
                      const cleanPhone = address.phone.replace(/\D/g, '').slice(-10);
                      const payload = {
                        fullName: address.name,
                        phone: cleanPhone,
                        addressLine1: address.addressLine1,
                        addressLine2: address.addressLine2 || undefined,
                        city: address.city,
                        state: address.state,
                        pincode: address.pincode,
                        isDefault: editingAddress ? editingAddress.isDefault : true,
                      };
                      let savedAddress;
                      if (isEdit) {
                        const addrId = editingAddress.addressId || editingAddress.id;
                        savedAddress = await addressService.updateAddress(addrId, payload);
                        console.log('Address updated in backend successfully:', savedAddress);
                      } else {
                        savedAddress = await addressService.createAddress(payload);
                        console.log('Address saved to backend successfully:', savedAddress);
                      }
                      
                      const resolvedAddress = {
                        ...savedAddress,
                        addressId: savedAddress.addressId || savedAddress.id,
                        name: savedAddress.fullName
                      };
                      setAddressData(resolvedAddress);
                      setEditingAddress(null);
                      
                      // Transition to overview panel view only after addressData has been resolved
                      setTimeout(() => {
                        setPanelView('overview');
                      }, 500);
                    } catch (err) {
                      console.error(isEdit ? 'Failed to update address on backend:' : 'Failed to create address on backend:', err);
                      // Graceful fallback to avoid blocking the user flow
                      setAddressData(address);
                      setEditingAddress(null);
                      setTimeout(() => {
                        setPanelView('overview');
                      }, 500);
                    }
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

const ProductCard = ({ item, onQuantityChange, onRemove, onSizeChange, isUpdating }) => {
  return (
    <div className={styles.productCard}>
      {isUpdating && (
        <div className={styles.cardLoaderOverlay}>
          <span className={loaderStyles.loader} style={{ width: '24px', height: '24px', borderWidth: '2px' }} aria-label="Loading"></span>
        </div>
      )}
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
            disabled={isUpdating}
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
            disabled={isUpdating}
          />

          <button
            className={styles.deleteBtn}
            onClick={() => onRemove(item.id)}
            aria-label="Remove item"
            disabled={isUpdating}
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
        {(item.discount > 0 || item.originalPrice > item.price) && (
          <span className={styles.discountBadge}>
            ({item.discount || Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% Off)
          </span>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
