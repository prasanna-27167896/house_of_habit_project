import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MobileSearchPanel.module.css';
import SlidePanel from '../../../../common/SlidePanel/SlidePanel';
import slidePanelStyles from '../../../../common/SlidePanel/SlidePanel.module.css';
import ProductCard from '../../../../common/ProductCard/ProductCard';

import { topSearches, trendingProducts } from '../../../../../data/searchData';
import { searchProducts } from '../../../../../services/productService';
import Loader from '../../../../common/Loader/Loader';

import LogoIcon from '../../../../../assets/icons/hoh-logo.svg?react';
import CloseIcon from '../../../../../assets/icons/nav-mobile-close-icon.svg?react';
import SearchIcon from '../../../../../assets/icons/search-icon.svg?react';
import MobileSlideHeader from '../../../../mobile-slide-header/MobileSlideHeader';

const SKELETON_COUNT = 4;
const DEBOUNCE_MS = 300;

const MobileSearchPanel = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  // Trending carousel pagination state
  const [carouselIndex, setCarouselIndex] = useState(0);
  const itemsPerPage = 2;
  const maxIndex = trendingProducts.length - itemsPerPage;

  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const navigate = useNavigate();

  // Reset state when panel opens/closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSearchResults([]);
      setHasSearched(false);
      setError(null);
      setIsLoading(false);
      setCarouselIndex(0);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const fetchResults = useCallback(async (keyword) => {
    if (abortRef.current) abortRef.current.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await searchProducts({ keyword });
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

  const handleTagClick = (tag) => {
    setQuery(tag);
  };

  const handleProductClick = (product, animateClose) => {
    const categoryTitle = product.category?.categoryTitle || '';
    const lower = categoryTitle.toLowerCase();
    let slug = 'polo-t-shirts';
    if (lower.includes('polo')) slug = 'polo-t-shirts';
    else if (lower.includes('hoodie')) slug = 'hoodies';
    else if (lower.includes('sweat')) slug = 'sweatshirt';

    const pId = product.productId || product.id;
    if (pId) {
      animateClose(() => {
        navigate(`/shop/${slug}/${pId}`);
      });
    }
  };

  const handlePrev = () => {
    setCarouselIndex((prev) => Math.max(0, prev - itemsPerPage));
  };

  const handleNext = () => {
    setCarouselIndex((prev) => Math.min(maxIndex, prev + itemsPerPage));
  };

  const isDefaultView = !query.trim();

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      className={styles.panel}
      overlayClassName={slidePanelStyles.mobileOnly}
      direction="up"
    >
      {({ animateClose }) => (
        <>
          {/* Header */}
          <MobileSlideHeader animateClose={animateClose} />

          <div className={styles.body}>
            {/* Search Input Bar */}
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}>
                <SearchIcon width={20} height={20} />
              </span>
              <input
                type='text'
                className={styles.searchInput}
                placeholder='Search By "Polo T shirts"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Default View: Top Searches + Trending Carousel */}
            {isDefaultView && (
              <>
                {/* Top Searches Section */}
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Top Searches</h3>
                  <div className={styles.tags}>
                    {topSearches.map((tag) => (
                      <button
                        key={tag}
                        className={styles.tag}
                        onClick={() => handleTagClick(tag)}
                      >
                        <SearchIcon width={16} height={16} className={styles.tagIcon} />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trending Section with Carousel Pagination */}
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Trending</h3>
                  <div className={styles.carouselContainer}>
                    <div className={styles.carouselGrid}>
                      {trendingProducts
                        .slice(carouselIndex, carouselIndex + itemsPerPage)
                        .map((product) => (
                          <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            price={product.price}
                            image={product.image}
                            onClick={() => handleProductClick(product, animateClose)}
                          />
                        ))}
                    </div>

                    <div className={styles.carouselControls}>
                      <button
                        className={styles.controlBtn}
                        onClick={handlePrev}
                        disabled={carouselIndex === 0}
                        aria-label="Previous trending products"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button
                        className={styles.controlBtn}
                        onClick={handleNext}
                        disabled={carouselIndex >= maxIndex}
                        aria-label="Next trending products"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Skeleton Loading State */}
            {!isDefaultView && isLoading && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Search Results</h3>
                <div className={styles.resultsGrid}>
                  {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <ProductCard key={i} skeleton />
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
                    <div className={styles.resultsGrid}>
                      {searchResults.map((product) => (
                        <ProductCard
                          key={product.productId}
                          id={product.productId}
                          title={product.title}
                          price={product.price}
                          discountedPrice={product.discountedPrice}
                          imageUrl={product.imageUrl}
                          category={product.category}
                          variants={product.variants}
                          onClick={() => handleProductClick(product, animateClose)}
                        />
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
        </>
      )}
    </SlidePanel >
  );
};

export default MobileSearchPanel;
