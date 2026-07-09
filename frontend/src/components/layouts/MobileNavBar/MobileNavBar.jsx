import { useLocation, useNavigate } from 'react-router-dom';
import styles from './MobileNavBar.module.css';

import HomeIcon from '../../../assets/icons/HomeIconNav.svg?react';
import BagIcon from '../../../assets/icons/CartIconNav.svg?react';
import CategoriesIcon from '../../../assets/icons/CategoriesIconNav.svg?react';
import SearchIcon from '../../../assets/icons/SearchIconNav.svg?react';
import UserIcon from '../../../assets/icons/ProfileIconNav.svg?react';


const NAV_ITEMS = [
  { id: 'home', icon: HomeIcon, label: 'Home', path: '/' },
  { id: 'cart', icon: BagIcon, label: 'Cart', action: 'cart' },
  { id: 'categories', icon: CategoriesIcon, label: 'Categories', action: 'menu', center: true },
  { id: 'search', icon: SearchIcon, label: 'Search', action: 'search' },
  { id: 'profile', icon: UserIcon, label: 'Profile', action: 'profile', path: '/account' },
];


const MobileNavBar = ({ activePanel, onAction }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTap = (item) => {
    if (item.action && onAction) {
      onAction(item.action);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <>
      <div className={styles.spacer} />

      <nav className={styles.navBar} id="mobile-nav-bar" aria-label="Mobile navigation">
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => {
            const { id, icon: Icon, label, path, action, center } = item;
            const isActive = (path && location.pathname === path) || (action && activePanel === action);


            if (center) {
              return (
                <li key={id} className={styles.centerItem}>
                  <button
                    className={styles.centerBtn}
                    aria-label={label}
                    onClick={() => handleTap(item)}
                  >
                    <Icon />
                  </button>
                </li>
              );
            }

            return (
              <li key={id} className={styles.navItem}>
                <button
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleTap(item)}
                >
                  <span className={styles.iconWrap}>
                    <Icon />
                  </span>
                  <span className={styles.label}>{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default MobileNavBar;
