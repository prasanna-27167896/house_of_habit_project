import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './Header.module.css';
import Popup from '../../common/Popup/AuthPopup';
import SearchPanel from './SearchPanel/SearchPanel';
import MobileSearchPanel from './SearchPanel/MobileSearchPanel/MobileSearchPanel';
import MenuPanel from './MenuPanel/MenuPanel';
import CartPanel from './CartPanel/CartPanel';
import MobileCartPanel from './CartPanel/MobileCartPanel/MobileCartPanel';
import MobileMenuPanel from './MenuPanel/MobileMenuPanel/MobileMenuPanel';
import MobileCategoryPanel from './CategoryPanel/MobileCategoryPanel';

import LogoIcon from "../../../assets/icons/hoh-logo.svg?react";
import SearchIcon from "../../../assets/icons/searchIcon.svg?react";
import UserIcon from "../../../assets/icons/UserIcon.svg?react";
import ProfileAvatar from "../../../assets/icons/profile-avatar.svg?react";
import BagIcon from "../../../assets/icons/BagIcon.svg?react";
import MenuIcon from "../../../assets/icons/MenuIcon.svg?react";

const Logo = () => {
  const navigate = useNavigate();
  return (
    <div
      className={styles.logo}
      onClick={() => {
        navigate("/");
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }}
    >
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
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { totalItems = 0 } = useSelector((state) => state.cart);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
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
    if (label === "Account") {
      if (isAuthenticated) {
        navigate('/account');
      } else {
        setOpenPanel("profile");
      }
    }
    if (label === "Search") setOpenPanel("search");
    if (label === "Menu") setOpenPanel("menu");
    if (label === "Cart") setOpenPanel("cart");
  };

  const handleMobileProfile = () => {
    if (isAuthenticated) {
      navigate('/account');
    } else {
      setOpenPanel("profile");
    }
  };

  return (
    <>
      <header
        className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
      >
        <div className={styles.inner}>
          <Logo />
          <nav className={styles.actions} aria-label="Site actions">
            {NAV_ICONS.map(({ icon: Icon, label }) => {
              const isAccountAvatar = label === "Account" && isAuthenticated;
              const IconComponent = isAccountAvatar ? ProfileAvatar : Icon;

              return (
                <button
                  key={label}
                  className={`${styles.iconBtn} ${isAccountAvatar ? styles.avatarBtn : ''}`}
                  aria-label={label}
                  onClick={() => handleIconClick(label)}
                >
                  <IconComponent width={32} height={32} />
                  {label === "Cart" && totalItems > 0 && (
                    <span className={styles.badge}>{totalItems}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>
      <Popup isOpen={openPanel === 'profile'} onClose={() => setOpenPanel(null)} />
      <SearchPanel isOpen={openPanel === 'search'} onClose={() => setOpenPanel(null)} />
      <MobileSearchPanel isOpen={openPanel === 'search'} onClose={() => setOpenPanel(null)} />
      <MenuPanel isOpen={openPanel === 'menu'} onClose={() => setOpenPanel(null)} />
      <MobileMenuPanel
        isOpen={openPanel === 'menu'}
        onClose={() => setOpenPanel(null)}
        onOpenCart={() => setOpenPanel('cart')}
        onOpenProfile={handleMobileProfile}
      />
      <CartPanel isOpen={openPanel === 'cart'} onClose={() => setOpenPanel(null)} />
      <MobileCartPanel isOpen={openPanel === 'cart'} onClose={() => setOpenPanel(null)} />
      <MobileCategoryPanel isOpen={openPanel === 'category'} onClose={() => setOpenPanel(null)} />
    </>
  );
};

export default Header;
