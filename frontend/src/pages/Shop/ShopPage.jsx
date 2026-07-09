import { useParams, Navigate } from 'react-router-dom';
import styles from './ShopPage.module.css';
import { categoryProducts, categoryMeta, slugToCategory } from '../../data/productsData';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import Button from '../../components/common/Button/Button';
import { SpinnerIcon } from '../../components/common/Icons/Icons';

const CategoryHero = ({ meta }) => {
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
        <Button variant='light' size='sm'>
          Shop Now
        </Button>
      </div>
    </section>
  );
};

const ShopPage = () => {
  const { category } = useParams();
  const categoryKey = slugToCategory[category];

  if (!categoryKey) return <Navigate to='/' replace />;

  const meta = categoryMeta[categoryKey];
  const products = categoryProducts[categoryKey];

  return (
    <main>
      <div className='container'>
        <CategoryHero meta={meta} />

        <section className={styles.products}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{meta.heroTitle}</h2>
            <p className={styles.sectionSub}>{meta.heroSub}</p>
          </div>

          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className={styles.loadMore}>
            <SpinnerIcon size={15} />
            <span>Loading More...</span>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ShopPage;
