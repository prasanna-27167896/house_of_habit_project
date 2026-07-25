import { useNavigate } from 'react-router-dom';
import styles from './MenuPanel.module.css';
import slidePanelStyles from '../../../common/SlidePanel/SlidePanel.module.css';
import LogoIcon from '../../../../assets/icons/hoh-logo.svg?react';
import FacebookIcon from '../../../../assets/icons/facebook-icon.svg?react';
import TwitterIcon from '../../../../assets/icons/twitter-icon.svg?react';
import LinkedInIcon from '../../../../assets/icons/linkedin-icon.svg?react';
import InstagramIcon from '../../../../assets/icons/instagram-icon.svg?react';
import { useEffect, useState } from 'react';
import { lenis } from '../../../../utils/lenis';

const SOCIAL_ICONS = [
  { icon: FacebookIcon, label: 'Facebook' },
  { icon: TwitterIcon, label: 'Twitter' },
  { icon: LinkedInIcon, label: 'LinkedIn' },
  { icon: InstagramIcon, label: 'Instagram' },
];

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Contact Us', path: '/contact' },
];

const SHOP_BY_ITEMS = [
  { label: 'Polo T-shirts', path: '/shop/polo-t-shirts' },
  { label: 'Hoodies', path: '/shop/hoodies' },
  { label: 'Sweatshirt', path: '/shop/sweatshirt' },
];

const MenuPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);
  const [isShopByOpen, setIsShopByOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
      setIsClosing(false);
    } else {
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }
    return () => {
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 600);
  };

  const handleNav = (path) => {
    setIsClosing(true);
    setTimeout(() => {
      navigate(path);
      onClose();
    }, 600);
  };

  const toggleShopBy = () => {
    setIsShopByOpen(!isShopByOpen);
  };

  const handleShopByNav = (path) => {
    setIsClosing(true);
    setTimeout(() => {
      navigate(path);
      onClose();
    }, 600);
  };

  return (
    <div className={`${styles.overlay} ${slidePanelStyles.desktopOnly}`} onClick={handleClose}>
      <div
        className={`${styles.panel} ${isClosing ? styles.closing : ''}`}
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={handleClose} aria-label='Close'>
          &#x2715;
        </button>

        <div className={styles.content}>
          {/* Left — Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <LogoIcon />
            </div>
            <p className={styles.website}>house of habit.com</p>
            <p className={styles.phone}>+91 8080808080</p>
          </div>

          {/* Right — Nav links */}
          <nav className={styles.nav}>
            {/* Home - 1st */}
            <button className={styles.navLink} onClick={() => handleNav(NAV_LINKS[0].path)}>
              {NAV_LINKS[0].label}
            </button>

            {/* Shop By with dropdown - 2nd */}
            <div className={styles.shopByContainer}>
              <button className={styles.navLink} onClick={toggleShopBy}>
                Shop By
              </button>
              <div className={`${styles.dropdown} ${isShopByOpen ? styles.open : ''}`}>
                {SHOP_BY_ITEMS.map(({ label, path }) => (
                  <button key={label} className={styles.dropdownItem} onClick={() => handleShopByNav(path)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Us - 3rd */}
            <button className={styles.navLink} onClick={() => handleNav(NAV_LINKS[1].path)}>
              {NAV_LINKS[1].label}
            </button>
          </nav>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.socials}>
            {SOCIAL_ICONS.map(({ icon: Icon, label }) => (
              <button key={label} className={styles.socialBtn} aria-label={label}>
                <Icon />
              </button>
            ))}
          </div>
          <div className={styles.footerRight}>
            <span className={styles.privacy}>Privacy Policy</span>
            <span className={styles.copyright}>&copy; 2025, House of Habit. All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPanel;
