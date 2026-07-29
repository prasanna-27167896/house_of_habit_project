import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './CheckoutPage.module.css';
import ProductSummaryHeader from '../../components/checkout/ProductSummaryHeader/ProductSummaryHeader';
import DeliveryCard from '../../components/checkout/DeliveryCard/DeliveryCard';
import CouponSection from '../../components/checkout/CouponSection/CouponSection';
import PaymentOptions from '../../components/checkout/PaymentOptions/PaymentOptions';
import DebitCardForm from '../../components/checkout/DebitCardForm/DebitCardForm';
import AddressModal from '../../components/checkout/AddressModal/AddressModal';
import { MOCK_CART_ITEMS, MOCK_ADDRESS } from '../../data/checkoutData';
import { getAddresses, createAddress } from '../../services/addressService';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('main'); // 'main' | 'card'
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [address, setAddress] = useState(MOCK_ADDRESS);
  const { items: reduxCartItems } = useSelector((state) => state.cart);
  const cartItems = reduxCartItems.length > 0 ? reduxCartItems : MOCK_CART_ITEMS;

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      try {
        const addresses = await getAddresses();
        if (addresses && addresses.length > 0) {
          const def = addresses.find((a) => a.isDefault) || addresses[0];
          setAddress({
            name: def.fullName,
            addressLine1: def.addressLine1,
            addressLine2: def.addressLine2 || `${def.city}, ${def.pincode}`,
            phone: def.phone,
            email: MOCK_ADDRESS.email,
            pincode: def.pincode,
            city: def.city,
            state: def.state,
          });
        }
      } catch (err) {
        console.error('Failed to load user addresses:', err);
      }
    };
    fetchDefaultAddress();
  }, []);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleBack = () => {
    if (view === 'card') {
      setView('main');
    } else {
      navigate(-1);
    }
  };

  const handleSelectPayment = (method) => {
    if (method === 'card') {
      setView('card');
    } else {
      // For UPI and COD, navigate directly to success
      navigate('/order-success');
    }
  };

  const handleCardSubmit = () => {
    navigate('/order-success');
  };

  const handleAddressSubmit = async (newAddress) => {
    const payload = {
      fullName: newAddress.name,
      phone: newAddress.mobile,
      addressLine1: newAddress.address1,
      addressLine2: newAddress.address2 || undefined,
      city: newAddress.city,
      state: newAddress.state,
      pincode: newAddress.pincode,
      isDefault: true,
    };
    try {
      const savedAddress = await createAddress(payload);
      setAddress({
        name: savedAddress.fullName,
        addressLine1: savedAddress.addressLine1,
        addressLine2: savedAddress.addressLine2 || `${savedAddress.city}, ${savedAddress.pincode}`,
        phone: savedAddress.phone,
        email: MOCK_ADDRESS.email,
        pincode: savedAddress.pincode,
        city: savedAddress.city,
        state: savedAddress.state,
      });
    } catch (err) {
      console.error('Failed to save checkout address:', err);
      // Fallback local state setting if API fails or user is not logged in
      setAddress({
        name: newAddress.name,
        addressLine1: `${newAddress.address1}`,
        addressLine2: `${newAddress.city}, ${newAddress.pincode}`,
        phone: `+91 ${newAddress.mobile}`,
        email: MOCK_ADDRESS.email,
        pincode: newAddress.pincode,
        city: newAddress.city,
        state: newAddress.state,
      });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ── Product Summary Header ── */}
        <ProductSummaryHeader items={cartItems} onBack={handleBack} />

        {view === 'main' ? (
          <div className={styles.content}>
            {/* ── Delivery Details ── */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Delivery Details</h3>
              <DeliveryCard
                address={address}
                onChangeAddress={() => setAddressModalOpen(true)}
              />
            </section>

            {/* ── Offers / Coupon ── */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Offers</h3>
              <CouponSection variant="checkout" />
            </section>

            {/* ── Payment Options ── */}
            <section className={styles.section}>
              <PaymentOptions
                totalPrice={totalPrice}
                onSelectPayment={handleSelectPayment}
              />
            </section>
          </div>
        ) : (
          <div className={styles.content}>
            <DebitCardForm
              onSubmit={handleCardSubmit}
              onCancel={() => setView('main')}
            />
          </div>
        )}
      </div>

      {/* ── Address Modal ── */}
      <AddressModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSubmit={handleAddressSubmit}
      />
    </div>
  );
};

export default CheckoutPage;
