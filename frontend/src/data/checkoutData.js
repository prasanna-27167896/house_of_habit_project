import DummyImage from '../assets/images/dummy-model.png';

/* ── Cart Items ── */
export const MOCK_CART_ITEMS = [
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
    name: 'GARUD SF SPECIAL EDITION Hoodie',
    image: DummyImage,
    size: 'M',
    quantity: 1,
    price: 1499,
    originalPrice: 2499,
    discount: 40,
  },
];

/* ── Saved Address ── */
export const MOCK_ADDRESS = {
  name: 'Siddu',
  addressLine1: '8/21 chandra layout vijayanagar, bangalore',
  addressLine2: 'karnataka, 560040',
  phone: '+91 9620099167',
  email: 'revanasiddappaarundi@gmail.com',
  pincode: '560040',
  city: 'Bangalore',
  state: 'Katakana',
};

/* ── Order Confirmation ── */
export const MOCK_ORDER = {
  orderNumber: 'ORD987654',
  paymentTime: '25-07-2024, 13:22:16',
  paymentMethod: 'Google Pay',
  orderDate: '01 June 2026',
  estimatedDelivery: '05-07 June 2026',
  amount: 2499,
};

/* ── Coupons ── */
export const MOCK_COUPONS = [
  { code: 'FIRST50', description: '50% off on first order', discount: 50 },
  { code: 'SAVE200', description: 'Flat ₹200 off', discount: 200 },
  { code: 'HOH10', description: '10% off sitewide', discount: 10 },
];
