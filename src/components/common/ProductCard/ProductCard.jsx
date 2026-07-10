import styles from './ProductCard.module.css';
import CartIcon from '../../../assets/icons/cart-add.svg?react';

const ProductCard = ({ name, price, image }) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={image} alt={name} className={styles.image} />
      </div>

      <div className={styles.productDetails}>
        <div className={styles.info}>
          <p className={styles.name}>{name}</p>
          <p className={styles.price}>₹ {price.toFixed(2)}</p>
        </div>

        <button className={styles.cartBtn}>
          <CartIcon />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
