import styles from './AccountSidebar.module.css';

const LogoutIcon = () => (
  <svg
    width='16'
    height='16'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
    <polyline points='16 17 21 12 16 7' />
    <line x1='21' y1='12' x2='9' y2='12' />
  </svg>
);

const NAV_ITEMS = [
  { id: 'profile', label: 'My Profile' },
  { id: 'orders', label: 'My Orders' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'support', label: 'Help & Support' },
];

const AccountSidebar = ({ activeTab, onTabChange }) => (
  <aside className={styles.sidebar}>
    <nav className={styles.nav}>
      {NAV_ITEMS.map(({ id, label }) => (
        <button key={id} className={`${styles.navItem} ${activeTab === id ? styles.active : ''}`} onClick={() => onTabChange(id)}>
          {label}
        </button>
      ))}

      <button className={`${styles.navItem} ${styles.logout}`}>
        <LogoutIcon />
        Logout
      </button>
    </nav>
  </aside>
);

export default AccountSidebar;
