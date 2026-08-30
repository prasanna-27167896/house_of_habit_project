import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchPanel.module.css';
import { topSearches, trendingProducts } from '../../../../data/searchData';
import { searchProducts } from '../../../../services/productService';
import Loader from '../../../common/Loader/Loader';
import SearchIcon from '../../../../assets/icons/search-icon.svg?react';
import DummyImage from '../../../../assets/images/dummy-model.png';

const SKELETON_COUNT = 5;

const DEBOUNCE_MS = 300;

const PLACEHOLDER_WORDS = ['Polo T-Shirts', 'Hoodies', 'Sweatshirts'];
const PLACEHOLDER_INTERVAL = 2500;

const SearchPanel = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Reset state when panel opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
    } else {
      document.body.style.overflow = '';
      // Reset search state when panel closes
      setQuery('');
      setSearchResults([]);
      setHasSearched(false);
      setError(null);
      setIsLoading(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Animated placeholder cycling
  useEffect(() => {
    if (query) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_WORDS.length);
    }, PLACEHOLDER_INTERVAL);
    return () => clearInterval(interval);
  }, [query]);

  const fetchResults = useCallback(async (keyword) => {
    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await searchProducts({ keyword });
      // Don't update state if this request was aborted
      if (controller.signal.aborted) return;

      const products = response?.data?.products || response?.products || [];
      setSearchResults(products);
      setHasSearched(true);
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
      setError('Something went wrong. Please try again.');
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();

    if (!trimmed) {
      // Reset to default view
      setSearchResults([]);
      setHasSearched(false);
      setError(null);
      setIsLoading(false);
      if (abortRef.current) abortRef.current.abort();
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      fetchResults(trimmed);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchResults]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 600);
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
  };

  const handleProductClick = (product) => {
    const categoryTitle = product.category?.categoryTitle || '';
    const lower = categoryTitle.toLowerCase();
    let slug = 'polo-t-shirts';
    if (lower.includes('polo')) slug = 'polo-t-shirts';
    else if (lower.includes('hoodie')) slug = 'hoodies';
    else if (lower.includes('sweat')) slug = 'sweatshirt';

    handleClose();
    navigate(`/shop/${slug}/${product.productId}`);
  };

  const isDefaultView = !query.trim();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={`${styles.panel} ${isClosing ? styles.closing : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={handleClose} aria-label='Close'>
          &#x2715;
        </button>

        <div className={styles.content}>
          {/* Search Input */}
          <div className={styles.searchBar} onClick={() => inputRef.current?.focus()}>
            <SearchIcon width={20} height={20} className={styles.searchIcon} />
            <div className={styles.inputWrapper}>
              <input
                ref={inputRef}
                type='text'
                className={styles.searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {!query && (
                <div className={styles.animatedPlaceholder}>
                  <span className={styles.placeholderStatic}>Search By</span>
                  <span className={styles.placeholderSlider} key={placeholderIndex}>
                    "{PLACEHOLDER_WORDS[placeholderIndex]}"
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Default View: Top Searches + Trending */}
          {isDefaultView && (
            <>
              {/* Top Searches */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Top Searches</h3>
                <div className={styles.tags}>
                  {topSearches.map((tag) => (
                    <span key={tag} className={styles.tag} onClick={() => handleTagClick(tag)}>
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
            </>
          )}

          {/* Skeleton Loading State */}
          {!isDefaultView && isLoading && (
            <div className={styles.section}>
              <div className={styles.skeletonTitle} />
              <div className={styles.trendingGrid}>
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonName} />
                    <div className={styles.skeletonPrice} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {!isDefaultView && !isLoading && error && (
            <div className={styles.statusMessage}>
              <Loader loadingText={error} />
            </div>
          )}

          {/* Search Results */}
          {!isDefaultView && !isLoading && !error && hasSearched && (
            <>
              {searchResults.length > 0 ? (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Search Results</h3>
                  <div className={styles.trendingGrid}>
                    {searchResults.map((product) => (
                      <div
                        key={product.productId}
                        className={styles.trendingCard}
                        onClick={() => handleProductClick(product)}
                      >
                        <div className={styles.trendingImage}>
                          <img src={product.imageUrl || DummyImage} alt={product.title} />
                        </div>
                        <p className={styles.trendingName}>{product.title}</p>
                        <p className={styles.trendingPrice}>
                          &#8377; {(product.discountedPrice ?? product.price ?? 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.statusMessage}>
                  <p className={styles.noResultsText}>No products found for "{query}"</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;

