import { useEffect, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ShopPage.module.css';
import { categoryMeta, slugToCategory } from '../../data/productsData';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import Button from '../../components/common/Button/Button';
import Loader from '../../components/common/Loader/Loader';
import { fetchAllCategories } from '../../store/slices/categorySlice';
import { fetchProductsByCategory, clearCategoryProducts } from '../../store/slices/productSlice';

const CategoryHero = ({ meta, onShopNow }) => {
  const bgStyle = {
    '--hero-bg-desktop': meta.heroBg.startsWith('url(') ? meta.heroBg : `url(${meta.heroBg})`,
    '--hero-bg-mobile': meta.heroBgMobile
      ? (meta.heroBgMobile.startsWith('url(') ? meta.heroBgMobile : `url(${meta.heroBgMobile})`)
      : (meta.heroBg.startsWith('url(') ? meta.heroBg : `url(${meta.heroBg})`),
  };

  return (
    <section className={`${styles.hero} ${meta.heroTextDark ? styles.heroDark : styles.heroLight}`} style={bgStyle}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>{meta.heroTitle}</h1>
        <p className={styles.heroSub}>{meta.heroSub}</p>
        <Button variant='light' size='sm' onClick={onShopNow}>
          Shop Now
        </Button>
      </div>
    </section>
  );
};

const ShopPage = () => {
  const { category } = useParams();
  const dispatch = useDispatch();

  const categoryKey = slugToCategory[category];
  const meta = categoryMeta[categoryKey];

  const { categories, isLoading: categoriesLoading } = useSelector((state) => state.category);
  const { categoryProducts, categoryPagination, categoryLoading } = useSelector((state) => state.product);
  const categoriesFetched = useRef(false);

  useEffect(() => {
    if (categories.length === 0 && !categoriesLoading) {
      dispatch(fetchAllCategories()).unwrap().finally(() => {
        categoriesFetched.current = true;
      });
    } else if (categories.length > 0) {
      categoriesFetched.current = true;
    }
  }, [dispatch, categories.length, categoriesLoading]);

  // Find matching category object from backend categories
  const matchedCategory = categories.find((cat) => {
    if (!categoryKey) return false;
    const catTitle = cat.categoryTitle.toLowerCase().trim();
    const targetKey = categoryKey.toLowerCase().trim();
    return catTitle === targetKey || catTitle.includes(targetKey) || targetKey.includes(catTitle);
  });

  useEffect(() => {
    // If categories are not loaded/attempted yet, wait to prevent dual fetches
    if (categories.length === 0 && !categoriesFetched.current) {
      return;
    }

    dispatch(clearCategoryProducts());
    if (categoryKey) {
      dispatch(
        fetchProductsByCategory({
          categoryId: matchedCategory?.categoryId,
          categoryName: categoryKey,
          page: 1,
          limit: 12,
        })
      );
    }
  }, [dispatch, matchedCategory?.categoryId, categoryKey, category, categories.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (categoryLoading) return;
      const { page, totalPages } = categoryPagination;
      if (page >= totalPages) return;

      const scrollBottom = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 500;
      if (scrollBottom >= threshold) {
        dispatch(
          fetchProductsByCategory({
            categoryId: matchedCategory?.categoryId,
            categoryName: categoryKey,
            page: page + 1,
            limit: 12,
            append: true,
          })
        );
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch, categoryLoading, categoryPagination, matchedCategory?.categoryId, categoryKey]);

  if (!categoryKey) return <Navigate to='/' replace />;

  const handleShopNow = () => {
    const el = document.getElementById('category-products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main>
      <div className='container'>
        {meta && <CategoryHero meta={meta} onShopNow={handleShopNow} />}

        <section id='category-products' className={styles.products}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{meta?.heroTitle || categoryKey}</h2>
            <p className={styles.sectionSub}>{meta?.heroSub || 'Contemporary clothing crafted for everyday confidence.'}</p>
          </div>

          <div className={styles.grid}>
            {categoryLoading && categoryProducts.length === 0 ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <ProductCard key={idx} skeleton={true} />
              ))
            ) : (
              categoryProducts.map((product) => (
                <ProductCard
                  key={product.productId || product.id}
                  {...product}
                  categorySlug={category}
                />
              ))
            )}
          </div>

          {categoryLoading && categoryProducts.length > 0 && (
            <div className={styles.loadMore}>
              <Loader loadingText="Loading More..." />
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ShopPage;



