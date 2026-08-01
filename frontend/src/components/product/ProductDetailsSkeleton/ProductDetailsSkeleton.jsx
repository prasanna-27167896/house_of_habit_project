import styles from './ProductDetailsSkeleton.module.css';
import ProductCard from '../../common/ProductCard/ProductCard';

const ProductDetailsSkeleton = () => {
  return (
    <main>
      <div className={styles.container}>
        {/* Breadcrumb Skeleton */}
        <div className={styles.breadcrumbSkeleton}>
          <div className={`${styles.breadcrumbItem} ${styles.shimmer}`} />
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <div className={`${styles.breadcrumbItem} ${styles.shimmer}`} />
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <div className={`${styles.breadcrumbItem} ${styles.shimmer}`} />
        </div>

        {/* Product Section Skeleton */}
        <section className={styles.productSection}>
          <div className={styles.galleryCol}>
            <div className={styles.gallery}>
              <div className={styles.thumbnails}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={`${styles.thumb} ${styles.shimmer}`} />
                ))}
              </div>
              <div className={`${styles.mainImage} ${styles.shimmer}`} />
            </div>
          </div>

          <div className={styles.infoCol}>
            <div className={styles.titleRow}>
              <div className={`${styles.titleSkeleton} ${styles.shimmer}`} />
              <div className={`${styles.shareBtnSkeleton} ${styles.shimmer}`} />
            </div>

            <div className={`${styles.subtitleSkeleton} ${styles.shimmer}`} />

            <div className={`${styles.ratingSkeleton} ${styles.shimmer}`} />

            <div className={`${styles.priceSkeleton} ${styles.shimmer}`} />
            <div className={`${styles.taxNoteSkeleton} ${styles.shimmer}`} />

            {/* Size Selector Skeleton */}
            <div className={styles.sizeSelectorSkeleton}>
              <div className={`${styles.sizeSelectorTitle} ${styles.shimmer}`} />
              <div className={styles.sizeGrid}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`${styles.sizeItem} ${styles.shimmer}`} />
                ))}
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className={styles.actionsContainer}>
              <div className={styles.rowOne}>
                <div className={`${styles.quantitySelector} ${styles.shimmer}`} />
                <div className={`${styles.addToBagBtn} ${styles.shimmer}`} />
              </div>
              <div className={`${styles.buyNowBtn} ${styles.shimmer}`} />
            </div>

            {/* Delivery Check Skeleton */}
            <div className={styles.deliveryCheckSkeleton}>
              <div className={`${styles.deliveryInput} ${styles.shimmer}`} />
              <div className={`${styles.deliveryButton} ${styles.shimmer}`} />
            </div>

            {/* Accordion Skeletons */}
            <div className={styles.accordionSkeleton}>
              <div className={styles.accordionHeader}>
                <div className={`${styles.accordionTitle} ${styles.shimmer}`} />
                <div className={`${styles.accordionIcon} ${styles.shimmer}`} />
              </div>
            </div>

            <div className={styles.accordionSkeleton}>
              <div className={styles.accordionHeader}>
                <div className={`${styles.accordionTitle} ${styles.shimmer}`} />
                <div className={`${styles.accordionIcon} ${styles.shimmer}`} />
              </div>
            </div>
          </div>
        </section>

        {/* Related Products Skeleton */}
        <section className={styles.related}>
          <div className={`${styles.relatedTitleSkeleton} ${styles.shimmer}`} />
          <div className={styles.relatedGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCard key={i} skeleton={true} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProductDetailsSkeleton;
