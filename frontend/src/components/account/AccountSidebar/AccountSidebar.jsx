import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './AccountSidebar.module.css';
import { logoutUser } from '../../../store/slices/authSlice';
import useAuthStore from '../../../store/useAuthStore';
import LogoutPopup from '../../../components/common/Popup/LogoutPopup';

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

const AccountSidebar = ({ activeTab, onTabChange }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const zustandLogout = useAuthStore((state) => state.logout);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logoutUser());
      zustandLogout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      navigate('/');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  return (
    <>
      <aside className={styles.sidebar}>
        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ id, label }) => (
            <button key={id} className={`${styles.navItem} ${activeTab === id ? styles.active : ''}`} onClick={() => onTabChange(id)}>
              {label}
            </button>
          ))}

          <button className={`${styles.navItem} ${styles.logout}`} onClick={() => setShowLogoutModal(true)}>
            <LogoutIcon />
            Logout
          </button>
        </nav>
      </aside>

      <LogoutPopup
        isOpen={showLogoutModal}
        isLoggingOut={isLoggingOut}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default AccountSidebar;
