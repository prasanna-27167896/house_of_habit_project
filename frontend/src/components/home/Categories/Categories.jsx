import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Categories.module.css';
import ProductCard from '../../common/ProductCard/ProductCard';
import { categoryProducts, categoryTabs, categoryMeta } from '../../../data/productsData';
import Loader from '../../common/Loader/Loader';

const Categories = () => {
  const [activeTab, setActiveTab] = useState(categoryTabs[0]);
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    navigate(`/shop/${categoryMeta[tab].slug}`);
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Categories</h2>
        <div className={styles.tabs} role='tablist'>
          {categoryTabs.map((tab) => (
            <button
              key={tab}
              role='tab'
              aria-selected={activeTab === tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {categoryMeta[tab].label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {categoryProducts[activeTab].map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      <div className={styles.loadMore}>
        <Loader loadingText='Loading More...' />
      </div>
    </section>
  );
};

export default Categories;
