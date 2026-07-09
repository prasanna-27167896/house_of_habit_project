import styles from './CartItem.module.css';
import DeleteIcon from '../../../../../assets/icons/delete-icon-cart.svg?react';
import dummy from '../../../../../assets/images/dummy-model.png';

const CartItem = ({ item, onRemove }) => {
  return (
    <div className={styles.cartItem}>
      <div className={styles.imageContainer}>
        <img src={dummy} alt={item.name} className={styles.image} />
      </div>

      <div className={styles.details}>
        <h3 className={styles.productName}>{item.name}</h3>
        <div className={styles.badges}>
          <span className={styles.badge}>{item.size}</span>
          <span className={styles.badge}>{item.quantity} item</span>
        </div>
        {item.discount && <span className={styles.discount}>{item.discount} off</span>}
      </div>

      <div className={styles.priceAndDelete}>
        <button className={styles.deleteBtn} onClick={() => onRemove(item.id)} aria-label='Remove item'>
          <DeleteIcon width={24} height={24} />
        </button>
        <div className={styles.priceSection}>
          {item.originalPrice > item.price && <span className={styles.originalPrice}>₹{item.originalPrice}</span>}
          <span className={styles.price}>₹{item.price}</span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
