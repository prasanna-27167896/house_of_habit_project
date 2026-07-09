import { useState, useEffect } from 'react';
import styles from './SearchPanel.module.css';
import { topSearches, trendingProducts } from '../../../../data/searchData';
import SearchIcon from '../../../../assets/icons/search-icon.svg?react';

const SearchPanel = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 600);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={`${styles.panel} ${isClosing ? styles.closing : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose} aria-label='Close'>
          &#x2715;
        </button>

        <div className={styles.content}>
          {/* Search Input */}
          <div className={styles.searchBar}>
            <SearchIcon width={20} height={20} className={styles.searchIcon} />
            <input
              type='text'
              className={styles.searchInput}
              placeholder='Search By "Polo T shirts"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Top Searches */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Top Searches</h3>
            <div className={styles.tags}>
              {topSearches.map((tag) => (
                <span key={tag} className={styles.tag}>
                  <SearchIcon width={14} height={14} className={styles.tagIcon} />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Trending</h3>
            <div className={styles.trendingGrid}>
              {trendingProducts.map((product) => (
                <div key={product.id} className={styles.trendingCard}>
                  <div className={styles.trendingImage}>
                    <img src={product.image} alt={product.name} />
                  </div>
                  <p className={styles.trendingName}>{product.name}</p>
                  <p className={styles.trendingPrice}>&#8377; {product.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;
