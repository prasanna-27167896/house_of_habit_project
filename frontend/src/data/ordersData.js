import DummyImage from '../assets/images/dummy-model.png';

export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  ORDER_PLACED: 'ORDER_PLACED',
  PLACED: 'placed',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'out-for-delivery',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURN_REQUESTED: 'RETURN_REQUESTED',
  RETURNED: 'RETURNED',
  RETURN_REJECTED: 'RETURN_REJECTED',
  OUT_FOR_PICKUP: 'out-for-pickup',
  REFUND_CREDITED: 'refund-credited',
};

export const STATUS_CONFIG = {
  // Backend upper-case statuses
  PENDING: { label: 'Pending', color: '#eab308' },
  ORDER_PLACED: { label: 'Placed', color: '#00a63e' },
  CONFIRMED: { label: 'Confirmed', color: '#00a63e' },
  PROCESSING: { label: 'Processing', color: '#3b82f6' },
  SHIPPED: { label: 'Shipped', color: '#00a63e' },
  IN_TRANSIT: { label: 'In Transit', color: '#00a63e' },
  DELIVERED: { label: 'Delivered', color: '#00a63e' },
  CANCELLED: { label: 'Cancelled', color: '#e53935' },
  RETURN_REQUESTED: { label: 'Return Requested', color: '#f59e0b' },
  RETURNED: { label: 'Returned', color: '#00a63e' },
  RETURN_REJECTED: { label: 'Return Rejected', color: '#e53935' },

  // Lower-case legacy support
  placed: { label: 'Placed', color: '#00a63e' },
  confirmed: { label: 'Confirmed', color: '#00a63e' },
  shipped: { label: 'Shipped', color: '#00a63e' },
  'out-for-delivery': { label: 'On Delivery', color: '#00a63e' },
  delivered: { label: 'Delivered', color: '#00a63e' },
  cancelled: { label: 'Cancelled', color: '#e53935' },
  'out-for-pickup': { label: 'Out For Pickup', color: '#00a63e' },
  'refund-credited': { label: 'Refund Credited', color: '#00a63e' },
};

export const getStatusConfig = (status) => {
  if (!status) return { label: 'Processing', color: '#3b82f6' };
  const upper = String(status).toUpperCase();
  const lower = String(status).toLowerCase();
  return STATUS_CONFIG[upper] || STATUS_CONFIG[lower] || STATUS_CONFIG[status] || { label: status, color: '#00a63e' };
};

export const normalizeOrder = (raw) => {
  if (!raw) return null;
  const id = raw.orderId || raw.id;
  const rawStatus = raw.orderStatus || raw.status || 'CONFIRMED';
  const status = String(rawStatus).toUpperCase();

  // Format items
  const items = (raw.orderItems && raw.orderItems.length > 0)
    ? raw.orderItems
    : raw.items || [];

  const firstItem = items[0] || {};
  const product = {
    orderItemId: firstItem.orderItemId || firstItem.id,
    variantId: firstItem.variantId,
    productId: firstItem.variant?.productId || firstItem.productId || raw.product?.productId || firstItem.variantId,
    name: firstItem.productTitle || firstItem.name || raw.product?.name || 'Solid Muscle Fit Polo shirt',
    description: firstItem.productTitle || raw.product?.description || 'Geometric textured Knit Slim Fit Polo',
    size: firstItem.size || raw.product?.size || 'M',
    qty: firstItem.quantity || raw.product?.qty || 1,
    price: firstItem.discountedPrice ?? firstItem.price ?? raw.product?.price ?? raw.totalAmount ?? 0,
    originalPrice: firstItem.price ?? raw.product?.originalPrice ?? raw.totalPrice ?? 0,
    image: firstItem.imageUrl || raw.product?.image || DummyImage,
  };

  const otherItems = items.slice(1).map((item) => ({
    orderItemId: item.orderItemId || item.id,
    variantId: item.variantId,
    productId: item.variant?.productId || item.productId || item.variantId,
    name: item.productTitle || item.name || 'Product',
    description: item.productTitle || '',
    size: item.size || 'M',
    qty: item.quantity || 1,
    price: item.discountedPrice ?? item.price ?? 0,
    image: item.imageUrl || DummyImage,
  }));

  const addr = raw.shippingAddress || raw.deliveryInfo || {};
  const fullAddress = [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.pincode]
    .filter(Boolean)
    .join(', ') || addr.address || 'Address not provided';

  const deliveryInfo = {
    name: addr.fullName || addr.name || raw.user?.fullName || 'Customer',
    phone: addr.mobile || addr.phone || raw.user?.mobile || '',
    address: fullAddress,
  };

  const payment = (raw.payments && raw.payments[0]) || {};
  const paymentMethod = payment.paymentMethod || 'Online Payment';

  // Format dates
  const orderedDateObj = raw.createdAt ? new Date(raw.createdAt) : null;
  const orderedOn = orderedDateObj
    ? orderedDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : raw.orderedOn || '';

  const deliveredDateObj = raw.deliveredAt ? new Date(raw.deliveredAt) : null;
  const isDelivered = status === 'DELIVERED';
  const isCancelled = status === 'CANCELLED';
  const isReturned = status === 'RETURNED' || status === 'RETURN_REQUESTED';

  let statusDate = '';
  if (isDelivered) {
    statusDate = deliveredDateObj
      ? `On ${deliveredDateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`
      : 'Delivered';
  } else if (isCancelled) {
    statusDate = raw.updatedAt
      ? `on ${new Date(raw.updatedAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`
      : 'Cancelled';
  } else if (raw.estimatedDelivery) {
    const est = new Date(raw.estimatedDelivery);
    statusDate = `Arriving by ${est.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`;
  } else {
    statusDate = raw.statusDate || 'Expected soon';
  }

  // Return window: within 7 days of delivery
  let returnWindowOpen = false;
  let returnWindow = null;
  if (isDelivered && deliveredDateObj) {
    const now = new Date();
    const diffDays = (now.getTime() - deliveredDateObj.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) {
      returnWindowOpen = true;
      const expiryDate = new Date(deliveredDateObj.getTime() + 7 * 24 * 60 * 60 * 1000);
      returnWindow = expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  }

  return {
    id,
    orderId: raw.orderId || raw.id || id,
    status,
    rawStatus,
    statusDate,
    statusDetail: raw.statusDetail || (isCancelled ? 'As per your request' : ''),
    orderedOn,
    product,
    otherItems,
    allItems: items,
    deliveryInfo,
    totalPrice: raw.totalAmount ?? raw.totalPrice ?? product.price,
    subtotal: raw.totalPrice ?? product.price,
    discount: raw.discount ?? 0,
    shippingCharge: raw.shippingCharge ?? 0,
    paymentMethod,
    returnWindow,
    returnWindowOpen,
    refundStatus: raw.refundStatus || 'NONE',
    refundDetails: raw.refundDetails || (
      (raw.refundStatus === 'REFUND_PENDING' || raw.refundStatus === 'REFUNDED' || isReturned) ? {
        amount: raw.totalAmount ?? raw.totalPrice ?? product.price ?? 0,
        method: paymentMethod,
        creditDate: raw.refundedAt ? new Date(raw.refundedAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : null,
        note: raw.refundStatus === 'REFUNDED'
          ? 'Refund has been processed to your original payment source.'
          : 'Refund will be processed to original payment source.',
      } : null
    ),
  };
};


export const mockOrders = [
  {
    id: 1,
    orderId: '1320503 63843645379401',
    status: ORDER_STATUSES.CONFIRMED,
    statusDate: 'Arriving by wed. 6 May',
    statusDetail: '',
    orderedOn: '18 Jan 2026',
    product: {
      name: 'Solid Muscle Fit Polo shirt',
      description: 'Brown Geometric textured Knit Slim Fit Polo',
      size: 'M',
      qty: 2,
      price: 654,
      image: DummyImage,
    },
    deliveryInfo: {
      name: 'Siddu',
      avatar: null,
      phone: '+91 9620099167',
      address: '#45, 2nd Floor, MG Road,BANGALORE, Karnataka 560001',
    },
    otherItems: [],
    returnWindow: null,
    trackingSteps: [
      { label: 'Order placed', date: 'on 01 May', completed: true },
    ],
    totalPrice: 654,
  },
  {
    id: 2,
    orderId: '1320503 63843645379402',
    status: ORDER_STATUSES.CANCELLED,
    statusDate: 'on Fri, 1 Dec 2023, 6:37 PM',
    statusDetail: 'As per your request',
    orderedOn: '28 Nov 2023',
    product: {
      name: 'Solid Muscle Fit Polo shirt',
      description: 'Brown Geometric textured Knit Slim Fit Polo',
      size: 'M',
      qty: 2,
      price: 654,
      image: DummyImage,
    },
    deliveryInfo: {
      name: 'Siddu',
      avatar: null,
      phone: '+91 9620099167',
      address: '#45, 2nd Floor, MG Road,BANGALORE, Karnataka 560001',
    },
    otherItems: [],
    returnWindow: null,
    trackingSteps: [],
    totalPrice: 654,
  },
  {
    id: 3,
    orderId: '1320503 63843645379403',
    status: ORDER_STATUSES.OUT_FOR_PICKUP,
    statusDate: 'Assigned to out delivery agent',
    statusDetail: '',
    orderedOn: '18 Jan 2026',
    product: {
      name: 'Solid Muscle Fit Polo shirt',
      description: 'Brown Geometric textured Knit Slim Fit Polo',
      size: 'M',
      qty: 2,
      price: 654,
      image: DummyImage,
    },
    deliveryInfo: {
      name: 'Siddu',
      avatar: null,
      phone: '+91 9620099167',
      address: '#45, 2nd Floor, MG Road,BANGALORE, Karnataka 560001',
    },
    otherItems: [],
    returnWindow: null,
    pickupDate: 'On Thus, 7 May, 8:28 AM',
    refundDetails: {
      amount: 667,
      method: 'UPI',
      note: 'Refund will be initiated once quality check is passed',
    },
    trackingSteps: [],
    totalPrice: 654,
  },
  {
    id: 4,
    orderId: '1320503 63843645379404',
    status: ORDER_STATUSES.DELIVERED,
    statusDate: 'On Fri, 28 Apr 2026, 2:47 PM',
    statusDetail: '',
    orderedOn: '18 Jan 2026',
    product: {
      name: 'Solid Muscle Fit Polo shirt',
      description: 'Brown Geometric textured Knit Slim Fit Polo',
      size: 'M',
      qty: 2,
      price: 654,
      image: DummyImage,
    },
    deliveryInfo: {
      name: 'Siddu',
      avatar: null,
      phone: '+91 9620099167',
      address: '#45, 2nd Floor, MG Road,BANGALORE, Karnataka 560001',
    },
    otherItems: [
      {
        name: 'Solid Muscle Fit Polo shirt',
        description: 'Brown Geometric textured Knit Slim Fit Polo',
        size: 'M',
        image: DummyImage,
      },
      {
        name: 'Solid Muscle Fit Polo shirt',
        description: 'Brown Geometric textured Knit Slim Fit Polo',
        size: 'M',
        image: DummyImage,
      },
    ],
    returnWindow: '04 May 2026',
    returnWindowOpen: false,
    trackingSteps: [],
    totalPrice: 654,
  },
  {
    id: 5,
    orderId: '1320503 63843645379405',
    status: ORDER_STATUSES.DELIVERED,
    statusDate: 'On Fri, 28 Apr 2026, 2:47 PM',
    statusDetail: '',
    orderedOn: '18 Jan 2026',
    product: {
      name: 'Solid Muscle Fit Polo shirt',
      description: 'Brown Geometric textured Knit Slim Fit Polo',
      size: 'M',
      qty: 2,
      price: 2099,
      image: DummyImage,
    },
    deliveryInfo: {
      name: 'Siddu',
      avatar: null,
      phone: '+91 9620099167',
      address: '#45, 2nd Floor, MG Road,BANGALORE, Karnataka 560001',
    },
    otherItems: [],
    returnWindow: '13 May',
    returnWindowOpen: true,
    trackingSteps: [],
    totalPrice: 654,
  },
  {
    id: 6,
    orderId: '1254415 99948760846701',
    status: ORDER_STATUSES.REFUND_CREDITED,
    statusDate: 'On Sat, 9 May 2026, 9:38 PM',
    statusDetail: 'Your refund of $667.00 for the return has been processed successfully on Sat, 9 may, 9:38 PM.',
    orderedOn: '18 Jan 2026',
    product: {
      name: 'Solid Muscle Fit Polo shirt',
      description: 'Brown Geometric textured Knit Slim Fit Polo',
      size: 'M',
      qty: 2,
      price: 654,
      image: DummyImage,
    },
    deliveryInfo: {
      name: 'Siddu',
      avatar: null,
      phone: '+91 9620099167',
      address: '#45, 2nd Floor, MG Road,BANGALORE, Karnataka 560001',
    },
    otherItems: [],
    returnWindow: null,
    refundDetails: {
      amount: 667,
      method: 'UPI',
      creditDate: 'Sat, 9 May',
      transactionRef: '103269318677',
      note: 'Have a dispute? Contact your bank with the refund transaction reference number 103269318677',
    },
    trackingSteps: [],
    totalPrice: 654,
  },
];
