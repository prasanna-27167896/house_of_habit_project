import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './OrdersPanel.module.css';
import PanelHeader from '../PanelHeader/PanelHeader';
import OrderCard from '../OrderCard/OrderCard';
import Button from '../../common/Button/Button';
import OrderDetailView from './OrderDetailView';
import CancelOrderView from './CancelOrderView';
import ReturnItemView from './ReturnItemView';
import SizeExchangeView from './SizeExchangeView';

import ArrowIcon from '../../../assets/icons/arrow-btn.svg?react';
import OrdersBagIcon from '../../../assets/icons/orders-bag-icon.svg?react';
import { fetchOrders } from '../../../store/slices/orderSlice';
import { normalizeOrder, mockOrders } from '../../../data/ordersData';

/* ── Inline icons ── */
const SearchIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#999' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='11' cy='11' r='8' />
    <line x1='21' y1='21' x2='16.65' y2='16.65' />
  </svg>
);

const FilterIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <line x1='4' y1='6' x2='20' y2='6' />
    <line x1='8' y1='12' x2='16' y2='12' />
    <line x1='11' y1='18' x2='13' y2='18' />
  </svg>
);

const CloseIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <line x1='18' y1='6' x2='6' y2='18' />
    <line x1='6' y1='6' x2='18' y2='18' />
  </svg>
);

const OrdersPanel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders: rawOrders, ordersLoading, ordersError } = useSelector((state) => state.order);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  /* ── Filter state ── */
  const [filterTab, setFilterTab] = useState('status'); // 'status' | 'time'
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTime, setSelectedTime] = useState('anytime');

  const [appliedStatus, setAppliedStatus] = useState('all');
  const [appliedTime, setAppliedTime] = useState('anytime');

  /* ── View state: controls which sub-view is displayed ── */
  const [view, setView] = useState({ type: 'list' });

  // Load orders on mount
  const loadOrders = useCallback(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Normalize raw orders from backend or fallback to empty array
  const normalizedOrders = useMemo(() => {
    if (rawOrders && rawOrders.length > 0) {
      return rawOrders.map(normalizeOrder);
    }
    return [];
  }, [rawOrders]);

  // Filter orders based on search query, applied status, and applied time
  const filteredOrders = useMemo(() => {
    return normalizedOrders.filter((order) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (order.product?.name && order.product.name.toLowerCase().includes(q)) ||
        (order.orderId && String(order.orderId).toLowerCase().includes(q)) ||
        (order.otherItems && order.otherItems.some((it) => it.name.toLowerCase().includes(q)));

      let matchesStatus = true;
      const st = (order.status || '').toUpperCase();
      if (appliedStatus === 'on-the-way') {
        matchesStatus =
          st === 'CONFIRMED' ||
          st === 'ORDER_PLACED' ||
          st === 'PROCESSING' ||
          st === 'SHIPPED' ||
          st === 'IN_TRANSIT' ||
          st === 'PENDING';
      } else if (appliedStatus === 'delivered') {
        matchesStatus = st === 'DELIVERED';
      } else if (appliedStatus === 'cancelled') {
        matchesStatus = st === 'CANCELLED';
      } else if (appliedStatus === 'returned') {
        matchesStatus =
          st === 'RETURNED' ||
          st === 'RETURN_REQUESTED' ||
          st === 'RETURN_REJECTED';
      }

      // Time filter
      let matchesTime = true;
      if (appliedTime !== 'anytime' && order.orderedOn) {
        const orderDate = new Date(order.orderedOn);
        if (!isNaN(orderDate.getTime())) {
          const now = new Date();
          const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
          if (appliedTime === '30-days') {
            matchesTime = diffDays <= 30;
          } else if (appliedTime === '6-months') {
            matchesTime = diffDays <= 180;
          } else if (appliedTime === 'year') {
            matchesTime = diffDays <= 365;
          }
        }
      }

      return matchesSearch && matchesStatus && matchesTime;
    });
  }, [normalizedOrders, searchQuery, appliedStatus, appliedTime]);

  const statusOptions = [
    { id: 'all', label: 'All' },
    { id: 'on-the-way', label: 'On the way' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'returned', label: 'Returned' },
  ];

  const timeOptions = [
    { id: 'anytime', label: 'Anytime' },
    { id: '30-days', label: 'Last 30 days' },
    { id: '6-months', label: 'Last 6 months' },
    { id: 'year', label: 'Last year' },
  ];

  const handleClearFilter = () => {
    setSelectedStatus('all');
    setSelectedTime('anytime');
    setAppliedStatus('all');
    setAppliedTime('anytime');
    setShowFilter(false);
  };

  const handleApplyFilter = () => {
    setAppliedStatus(selectedStatus);
    setAppliedTime(selectedTime);
    setShowFilter(false);
  };

  /* ── Navigation handlers ── */
  const handleNavigate = (target) => {
    setView(target);
  };

  const handleBack = (target) => {
    if (target && target.type) {
      setView(target);
    } else {
      setView({ type: 'list' });
      loadOrders(); // reload orders in case status was modified
    }
  };

  /* ── Search + Filter action slot for PanelHeader ── */
  const headerAction = (
    <div className={styles.headerActions}>
      <div className={styles.searchBox}>
        <SearchIcon />
        <input
          type='text'
          className={styles.searchInput}
          placeholder='Search orders or items...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className={styles.filterWrapper}>
        <button
          className={`${styles.filterBtn} ${showFilter || appliedStatus !== 'all' || appliedTime !== 'anytime' ? styles.filterBtnActive : ''}`}
          onClick={() => setShowFilter((p) => !p)}
        >
          <FilterIcon /> Filter
        </button>

        {showFilter && (
          <div className={styles.filterDropdown}>
            {/* Header */}
            <div className={styles.filterHeader}>
              <h3 className={styles.filterTitle}>Filter Orders</h3>
              <button
                className={styles.closeFilterBtn}
                onClick={() => setShowFilter(false)}
                aria-label='Close filter'
              >
                <CloseIcon />
              </button>
            </div>

            {/* Tabs */}
            <div className={styles.tabSegment}>
              <button
                className={`${styles.tabBtn} ${filterTab === 'status' ? styles.tabBtnActive : ''}`}
                onClick={() => setFilterTab('status')}
              >
                Status
              </button>
              <button
                className={`${styles.tabBtn} ${filterTab === 'time' ? styles.tabBtnActive : ''}`}
                onClick={() => setFilterTab('time')}
              >
                Time
              </button>
            </div>

            {/* Content */}
            <div className={styles.filterContent}>
              {filterTab === 'status' ? (
                <div className={styles.optionsList}>
                  {statusOptions.map((opt) => (
                    <label key={opt.id} className={styles.optionItem}>
                      <input
                        type='radio'
                        name='statusFilter'
                        className={styles.checkboxInput}
                        checked={selectedStatus === opt.id}
                        onChange={() => setSelectedStatus(opt.id)}
                      />
                      <span className={styles.checkboxCustom} />
                      <span className={styles.optionLabel}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className={styles.optionsList}>
                  {timeOptions.map((opt) => (
                    <label key={opt.id} className={styles.optionItem}>
                      <input
                        type='radio'
                        name='timeFilter'
                        className={styles.checkboxInput}
                        checked={selectedTime === opt.id}
                        onChange={() => setSelectedTime(opt.id)}
                      />
                      <span className={styles.checkboxCustom} />
                      <span className={styles.optionLabel}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={styles.filterFooter}>
              <button className={styles.clearBtn} onClick={handleClearFilter}>
                Clear
              </button>
              <button className={styles.applyBtn} onClick={handleApplyFilter}>
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const isListView = view.type === 'list';

  // Get Panel Header configuration based on view
  let headerTitle = 'Order History';
  let headerSubtitle = 'View and track your past orders.';
  let headerPrefix = null;
  let headerActionSlot = null;

  if (isListView) {
    headerActionSlot = headerAction;
  } else {
    const BackArrowIcon = () => (
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
        <polyline points='15 18 9 12 15 6' />
      </svg>
    );

    const onBackClick = () => {
      if (view.type === 'detail') {
        handleBack();
      } else {
        handleBack({ type: 'detail', orderId: view.orderId });
      }
    };

    headerPrefix = (
      <button className={styles.backBtn} onClick={onBackClick} aria-label='Go back'>
        <BackArrowIcon />
      </button>
    );

    if (view.type === 'detail') {
      headerTitle = 'Order Details';
      const order = normalizedOrders.find((o) => String(o.id) === String(view.orderId));
      headerSubtitle = order ? `Order ID # ${order.orderId}` : '';
    } else if (view.type === 'cancel') {
      headerTitle = 'Cancel Item';
      headerSubtitle = 'Tell us why you want to cancel this item.';
    } else if (view.type === 'return') {
      headerTitle = 'Return Item';
      headerSubtitle = 'Tell us why you want to return this item.';
    } else if (view.type === 'size-exchange') {
      headerTitle = 'Size Exchange';
      headerSubtitle = 'Select the replacement size and reason.';
    }
  }

  /* ── Empty state (no orders at all) ── */
  if (!ordersLoading && normalizedOrders.length === 0 && isListView) {
    return (
      <div className={styles.panel}>
        <PanelHeader title='Order History' subtitle='View and track your past orders.' />

        <div className={styles.emptyState}>
          <OrdersBagIcon width={140} height={160} />
          <p className={styles.emptyText}>You haven't placed any orders yet.</p>
          <Button variant='light' size='sm' bgColor='#1e1e1e' textColor='#ffffff' onClick={() => navigate('/shop')}>
            Continue Shopping <ArrowIcon width={30} height={30} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <PanelHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        prefix={headerPrefix}
        action={headerActionSlot}
      />

      {/* ── Order list or sub-views ── */}
      <div className={styles.scrollWrapper}>
        {isListView ? (
          <div className={styles.orderList}>
            {ordersLoading && normalizedOrders.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div className="dots-loading" style={{ margin: '0 auto', color: '#ff5f15' }}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} onNavigate={handleNavigate} />
              ))
            ) : (
              <p className={styles.noResults}>No orders found matching your criteria.</p>
            )}
          </div>
        ) : (
          <>
            {view.type === 'detail' && (
              <OrderDetailView orderId={view.orderId} onBack={handleBack} onNavigate={handleNavigate} />
            )}
            {view.type === 'cancel' && (
              <CancelOrderView orderId={view.orderId} onBack={handleBack} />
            )}
            {view.type === 'return' && (
              <ReturnItemView orderId={view.orderId} onBack={handleBack} />
            )}
            {view.type === 'size-exchange' && (
              <SizeExchangeView orderId={view.orderId} onBack={handleBack} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPanel;
