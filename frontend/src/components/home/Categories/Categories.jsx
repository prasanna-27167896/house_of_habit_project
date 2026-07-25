import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Categories.module.css';
import ProductCard from '../../common/ProductCard/ProductCard';
import Loader from '../../common/Loader/Loader';
import { fetchAllProducts } from '../../../store/slices/productSlice';

const Categories = () => {
  const dispatch = useDispatch();
  const { allProducts, allProductsPagination, allProductsLoading } = useSelector((state) => state.product);

  useEffect(() => {
    if (allProducts.length === 0) {
      dispatch(fetchAllProducts({ page: 1, limit: 12 }));
    }
  }, [dispatch, allProducts.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (allProductsLoading) return;
      const { page, totalPages } = allProductsPagination;
      if (page >= totalPages) return;

      const scrollBottom = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 500;
      if (scrollBottom >= threshold) {
        dispatch(fetchAllProducts({ page: page + 1, limit: 12, append: true }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch, allProductsLoading, allProductsPagination]);

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

      {allProductsLoading && allProducts.length > 0 && (
        <div className={styles.loadMore}>
          <Loader loadingText="Loading More..." />
        </div>
      )}
    </section>
  );
};

export default Categories;


