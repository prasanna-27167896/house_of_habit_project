import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Categories.module.css';
import ProductCard from '../../common/ProductCard/ProductCard';
import Loader from '../../common/Loader/Loader';
import { fetchAllProducts } from '../../../store/slices/productSlice';

const Categories = () => {
  const dispatch = useDispatch();
  const { allProducts, allProductsPagination, allProductsLoading } = useSelector((state) => state.product);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (allProducts.length === 0) {
      dispatch(fetchAllProducts({ page: 1, limit: 12 }));
    }
  }, [dispatch, allProducts.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !allProductsLoading) {
          const { page, totalPages } = allProductsPagination;
          if (page < totalPages) {
            dispatch(fetchAllProducts({ page: page + 1, limit: 12, append: true }));
          }
        }
      },
      { rootMargin: '300px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    const handleScroll = () => {
      if (allProductsLoading) return;
      const { page, totalPages } = allProductsPagination;
      if (page >= totalPages) return;

      const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const totalHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );

      if (scrollTop + windowHeight >= totalHeight - 600) {
        dispatch(fetchAllProducts({ page: page + 1, limit: 12, append: true }));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
    };
  }, [dispatch, allProductsLoading, allProductsPagination]);

  const hasMore = allProductsPagination.page < allProductsPagination.totalPages;
  const showEndMessage = !allProductsLoading && !hasMore && allProducts.length > 0;

  return (
    <section id="collections" className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Collections</h2>
      </div>

      <div className={styles.grid}>
        {allProductsLoading && allProducts.length === 0 ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <ProductCard key={idx} skeleton={true} />
          ))
        ) : (
          allProducts.map((product) => (
            <ProductCard key={product.productId || product.id} {...product} />
          ))
        )}
      </div>

      <div ref={loadMoreRef} className={styles.loadMoreContainer}>
        {allProductsLoading && allProducts.length > 0 && (
          <div className={styles.loadMore}>
            <Loader loadingText="Loading More..." />
          </div>
        )}

        {showEndMessage && (
          <div className={styles.loadMore}>
            <Loader loadingText="You have reached products end" showSpinner={false} />
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;


