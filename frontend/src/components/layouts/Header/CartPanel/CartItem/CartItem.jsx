import styles from './CartItem.module.css';
import DeleteIcon from '../../../../../assets/icons/delete-icon-cart.svg?react';
import dummy from '../../../../../assets/images/dummy-model.png';

const CartItem = ({ item, onRemove, isDeleting }) => {
  return (
    <div className={styles.cartItem}>
      <div className={styles.imageContainer}>
        <img src={item.image || dummy} alt={item.name} className={styles.image} />
      </div>

      <div className={styles.details}>
        <h3 className={styles.productName}>{item.name}</h3>
        <div className={styles.badges}>
          <span className={styles.badge}>{item.size}</span>
          <span className={styles.badge}>{item.quantity} item</span>
        </div>
        {item.discount > 0 && <span className={styles.discount}>{item.discount}% off</span>}
      </div>

      <div className={styles.priceAndDelete}>
        <button
          className={styles.deleteBtn}
          onClick={() => onRemove(item.id)}
          disabled={isDeleting}
          aria-label='Remove item'
          style={{ position: 'relative' }}
        >
          <DeleteIcon
            width={24}
            height={24}
            style={{
              visibility: isDeleting ? 'hidden' : 'visible',
              opacity: isDeleting ? 0 : 1
            }}
          />
          {isDeleting && (
            <span className="absolute-loader">
              <span className="simple-spinner" style={{ color: '#ff5f15', width: '18px', height: '18px' }}></span>
            </span>
          )}
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
