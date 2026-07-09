import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import Popup from '../../common/Popup/AuthPopup';
import SearchPanel from './SearchPanel/SearchPanel';
import MenuPanel from './MenuPanel/MenuPanel';
import CartPanel from './CartPanel/CartPanel';
import MobileMenuPanel from './MenuPanel/MobileMenuPanel/MobileMenuPanel';

import LogoIcon from "../../../assets/icons/hoh-logo.svg?react";
import SearchIcon from "../../../assets/icons/searchIcon.svg?react";
import UserIcon from "../../../assets/icons/UserIcon.svg?react";
import BagIcon from "../../../assets/icons/BagIcon.svg?react";
import MenuIcon from "../../../assets/icons/MenuIcon.svg?react";

const Logo = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.logo} onClick={() => navigate("/")}>
      <LogoIcon />
    </div>
  );
};

const NAV_ICONS = [
  { icon: SearchIcon, label: "Search" },
  { icon: UserIcon, label: "Account" },
  { icon: BagIcon, label: "Cart" },
  { icon: MenuIcon, label: "Menu" },
];

const Header = ({ openPanel, setOpenPanel }) => {
  // Track scroll state
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // If the user scrolls down more than 10px, trigger the state
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleIconClick = (label) => {
    if (label === "Account") setOpenPanel("profile");
    if (label === "Search") setOpenPanel("search");
    if (label === "Menu") setOpenPanel("menu");
    if (label === "Cart") setOpenPanel("cart");
  };

  return (
    <>
      {/* Apply the scrolled class conditionally */}
      <header
        className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
      >
        <div className={styles.inner}>
          <Logo />
          <nav className={styles.actions} aria-label="Site actions">
            {NAV_ICONS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                className={styles.iconBtn}
                aria-label={label}
                onClick={() => handleIconClick(label)}
              >
                <Icon width={32} height={32} />
              </button>
            ))}
          </nav>
        </div>
      </header>
      <Popup isOpen={openPanel === 'profile'} onClose={() => setOpenPanel(null)} />
      <SearchPanel isOpen={openPanel === 'search'} onClose={() => setOpenPanel(null)} />
      <MenuPanel isOpen={openPanel === 'menu'} onClose={() => setOpenPanel(null)} />
      <MobileMenuPanel
        isOpen={openPanel === 'menu'}
        onClose={() => setOpenPanel(null)}
        onOpenCart={() => setOpenPanel('cart')}
        onOpenProfile={() => setOpenPanel('profile')}
      />
      <CartPanel isOpen={openPanel === 'cart'} onClose={() => setOpenPanel(null)} />
    </>
  );
};

export default Header;
