import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import useAuthStore from '../../../../../store/useAuthStore';
import { logoutUser } from '../../../../../store/slices/authSlice';
import SlidePanel from '../../../../common/SlidePanel/SlidePanel';
import slidePanelStyles from '../../../../common/SlidePanel/SlidePanel.module.css';
import styles from './MobileMenuPanel.module.css';
import LogoutPopup from '../../../../common/Popup/LogoutPopup';

import LogoIcon from '../../../../../assets/icons/hoh-logo.svg?react';
import BagIcon from '../../../../../assets/icons/nav-mobile-cart-icon.svg?react';
import LogoutIcon from "../../../../../assets/icons/logout-icon.svg?react"
import UserIcon from '../../../../../assets/icons/nav-mobile-account-icon.svg?react';
import CloseIcon from "../../../../../assets/icons/nav-mobile-close-icon.svg?react"

import FacebookIcon from '../../../../../assets/icons/facebook-menu-icon.svg?react';
import TwitterIcon from '../../../../../assets/icons/twitter-menu-icon.svg?react';
import LinkedInIcon from '../../../../../assets/icons/linkedin-menu-icon.svg?react';
import InstagramIcon from '../../../../../assets/icons/instagram-menu-icon.svg?react';
import MobileSlideHeader from '../../../../mobile-slide-header/MobileSlideHeader';

/* ── Static data ─────────────────────────────────────────────────── */

const SOCIAL_LINKS = [
  { icon: FacebookIcon, label: 'Facebook', href: 'https://facebook.com' },
  { icon: TwitterIcon, label: 'Twitter', href: 'https://twitter.com' },
  { icon: LinkedInIcon, label: 'LinkedIn', href: 'https://linkedin.com' },
  { icon: InstagramIcon, label: 'Instagram', href: 'https://instagram.com' },
];

const NAV_ITEMS = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'polo', label: 'Polo T-shirts', path: '/shop/polo-t-shirts' },
  { id: 'hoodies', label: 'Hoodies', path: '/shop/hoodies' },
  { id: 'sweat', label: 'Sweatshirt', path: '/shop/sweatshirt' },
  { id: 'contact', label: 'Contact Us', path: '/contact' },
];


const NavRow = ({ label, icon: Icon, onClick }) => (
  <li className={styles.navItem}>
    <button
      className={`${styles.navBtn}`}
      onClick={onClick}
      aria-label={label}
    >
      <span className={styles.navLeft}>
        {Icon && <span className={styles.navIcon}><Icon /></span>}
        <span className={styles.navLabel}>{label}</span>
      </span>
    </button>
    <hr className={styles.navDivider} />
  </li>
);


const MobileMenuPanel = ({ isOpen, onClose, onOpenCart, onOpenProfile }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logoutUser());
      logout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      navigate('/');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  return (
    <>
      <SlidePanel
        isOpen={isOpen}
        onClose={onClose}
        className={styles.panel}
        overlayClassName={slidePanelStyles.mobileOnly}
      >
        {({ animateClose }) => {
          const go = (path) => animateClose(() => {
            navigate(path);
            if (path === '/') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          });

          return (
            <>
              <MobileSlideHeader animateClose={animateClose} />

              {/* ── Nav list ── */}
              <nav aria-label="Mobile navigation">
                <ul className={styles.navList}>
                  {NAV_ITEMS.map(({ id, label, path }) => (
                    <NavRow key={id} label={label} onClick={() => go(path)} />
                  ))}

                  {/* Cart */}
                  <NavRow
                    label="Cart"
                    icon={BagIcon}
                    onClick={() => animateClose(() => onOpenCart?.())}
                  />

                  {/* Account */}
                  <NavRow
                    label="Account"
                    icon={UserIcon}
                    onClick={() => animateClose(() => onOpenProfile?.())}
                  />

                  {/* Logout — only when signed in */}
                  {isAuthenticated && (
                    <NavRow
                      label="Logout"
                      icon={LogoutIcon}
                      onClick={() => animateClose(() => setShowLogoutModal(true))}
                    />
                  )}
                </ul>
              </nav>

              <div className={styles.spacer} />

              <footer className={styles.footer}>
                <div className={styles.socials}>
                  {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialBtn}
                      aria-label={label}
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
                <hr className={styles.footerDivider} />
                <div className={styles.footerBottom}>
                  <span className={styles.privacy}>Privacy Policy</span>
                  <span className={styles.copy}>
                    &copy; 2025, House of Habit. All Rights Reserved.
                  </span>
                </div>
              </footer>
            </>
          );
        }}
      </SlidePanel>

      <LogoutPopup
        isOpen={showLogoutModal}
        isLoggingOut={isLoggingOut}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default MobileMenuPanel;
