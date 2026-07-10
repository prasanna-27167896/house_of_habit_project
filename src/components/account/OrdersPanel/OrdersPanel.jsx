import { useState } from 'react';
import styles from './OrdersPanel.module.css';
import PanelHeader from '../PanelHeader/PanelHeader';
import OrderCard from '../OrderCard/OrderCard';
import Button from '../../common/Button/Button';

import ArrowIcon from '../../../assets/icons/arrow-btn.svg?react';
import OrdersBagIcon from '../../../assets/icons/orders-bag-icon.svg?react';
import { mockOrders } from '../../../data/ordersData';

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

const OrdersPanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  const orders = mockOrders;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderId.includes(searchQuery);
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'refund-credited', label: 'Refund' },
  ];

  /* ── Search + Filter action slot for PanelHeader ── */
  const headerAction = (
    <div className={styles.headerActions}>
      <div className={styles.searchBox}>
        <SearchIcon />
        <input
          type='text'
          className={styles.searchInput}
          placeholder='Search anything here'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <button className={styles.filterBtn} onClick={() => setShowFilter((p) => !p)}>
        <FilterIcon /> Filter
      </button>
    </div>
  );

  /* ── Empty state (no orders at all) ── */
  if (orders.length === 0) {
    return (
      <div className={styles.panel}>
        <PanelHeader title='Order History' subtitle='View and track your past orders.' />

        <div className={styles.emptyState}>
          <OrdersBagIcon width={140} height={160} />
          <p className={styles.emptyText}>You haven't placed any orders yet.</p>
          <Button variant='dark' size='sm'>
            Continue Shopping <ArrowIcon width={30} height={30} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <PanelHeader title='Order History' subtitle='View and track your past orders.' action={headerAction} />

      {/* ── Filter pills ── */}
      {showFilter && (
        <div className={styles.filterRow}>
          {filters.map((f) => (
            <button
              key={f.id}
              className={`${styles.filterPill} ${activeFilter === f.id ? styles.filterActive : ''}`}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Order list ── */}
      <div className={styles.orderList}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <p className={styles.noResults}>No orders found matching your search.</p>
        )}
      </div>
    </div>
  );
};

export default OrdersPanel;
