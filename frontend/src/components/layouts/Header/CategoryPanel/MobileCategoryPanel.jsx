import { useNavigate } from 'react-router-dom';
import styles from './MobileCategoryPanel.module.css';
import SlidePanel from '../../../common/SlidePanel/SlidePanel';
import slidePanelStyles from '../../../common/SlidePanel/SlidePanel.module.css';

import LogoIcon from '../../../../assets/icons/hoh-logo.svg?react';
import CloseIcon from '../../../../assets/icons/nav-mobile-close-icon.svg?react';

import PoloImg from '../../../../assets/images/Polo T-shirt.png';
import HoodiesImg from '../../../../assets/images/Hoodies.png';
import SweatshirtImg from '../../../../assets/images/Sweatshirt.png';

const CATEGORIES = [
  { id: 'polo', label: 'Polo T-shirt', path: '/shop/polo-t-shirts', image: PoloImg },
  { id: 'hoodies', label: 'Hoodies', path: '/shop/hoodies', image: HoodiesImg },
  { id: 'sweatshirt', label: 'Sweatshirt', path: '/shop/sweatshirt', image: SweatshirtImg },
];

const MobileCategoryPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      className={styles.panel}
      overlayClassName={slidePanelStyles.mobileOnly}
      direction="up"
    >
      {({ animateClose }) => {
        const handleCategoryClick = (path) => {
          animateClose(() => {
            navigate(path);
          });
        };

        return (
          <>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.logo}><LogoIcon /></div>
              <button
                className={styles.closeBtn}
                onClick={() => animateClose()}
                aria-label="Close categories"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Body */}
            <div className={styles.body}>
              <h2 className={styles.title}>Category</h2>
              <p className={styles.subtitle}>View and track your past orders.</p>

              <div className={styles.cardsList}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={styles.card}
                    onClick={() => handleCategoryClick(cat.path)}
                  >
                    <img src={cat.image} alt={cat.label} className={styles.cardImage} />
                    <div className={styles.cardOverlay}>
                      <span className={styles.cardText}>{cat.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        );
      }}
    </SlidePanel>
  );
};

export default MobileCategoryPanel;
