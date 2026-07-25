import { useNavigate } from 'react-router-dom';
import styles from './ProductCard.module.css';
import CartIcon from '../../../assets/icons/cart-add.svg?react';
import DummyImage from '../../../assets/images/dummy-model.png';

const getCategorySlug = (category, categoryTitle, categorySlug) => {
  if (categorySlug) return categorySlug;
  const title = categoryTitle || (typeof category === 'object' ? category?.categoryTitle : category) || '';
  const lower = title.toLowerCase();
  if (lower.includes('polo')) return 'polo-t-shirts';
  if (lower.includes('hoodie')) return 'hoodies';
  if (lower.includes('sweat')) return 'sweatshirt';
  return 'polo-t-shirts';
};

const ProductCard = ({
  id,
  productId,
  name,
  title,
  price,
  discountedPrice,
  image,
  imageUrl,
  category,
  categoryTitle,
  categorySlug,
  onClick,
  skeleton,
}) => {
  const navigate = useNavigate();

  if (skeleton) {
    return (
      <div className={styles.skeletonCard}>
        <div className={styles.skeletonImageWrapper} />
        <div className={styles.skeletonDetails}>
          <div className={styles.skeletonInfo}>
            <div className={styles.skeletonName} />
            <div className={styles.skeletonPrice} />
          </div>
          <div className={styles.skeletonCartBtn} />
        </div>
      </div>
    );
  }

  const pId = productId || id;
  const displayName = title || name || '';
  const numPrice = discountedPrice ?? price ?? 0;
  const formattedPrice = typeof numPrice === 'number' ? numPrice.toFixed(2) : Number(numPrice || 0).toFixed(2);
  const displayImage = imageUrl || image || DummyImage;
  const slug = getCategorySlug(category, categoryTitle, categorySlug);

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (pId) {
      navigate(`/shop/${slug}/${pId}`);
    }
  };

  const handleCartClick = (e) => {
    e.stopPropagation();
    // Add to cart functionality if needed in future
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.imageWrapper}>
        <img src={displayImage} alt={displayName} className={styles.image} />
      </div>

      <div className={styles.productDetails}>
        <div className={styles.info}>
          <p className={styles.name}>{displayName}</p>
          <p className={styles.price}>₹ {formattedPrice}</p>
        </div>

        <button type="button" className={styles.cartBtn} onClick={handleCartClick} aria-label="Add to cart">
          <CartIcon />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

