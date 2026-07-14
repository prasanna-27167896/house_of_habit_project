import { useState } from 'react';
import styles from './CartDrawerItem.module.css';
import QuantitySelector from '../QuantitySelector/QuantitySelector';
import DeleteIcon from '../../../assets/icons/delete-icon-cart.svg?react';

const CartDrawerItem = ({ item, onQuantityChange, onRemove }) => {
  const [size, setSize] = useState(item.size || 'S');

  return (
    <div className={styles.cartItem}>
      <div className={styles.imageWrap}>
        <img src={item.image} alt={item.name} className={styles.image} />
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{item.name}</h3>

        <div className={styles.sizeSelect}>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className={styles.select}
          >
            {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className={styles.actions}>
          <QuantitySelector
            quantity={item.quantity}
            onIncrement={() => onQuantityChange(item.id, item.quantity + 1)}
            onDecrement={() => onQuantityChange(item.id, item.quantity - 1)}
          />
          <button
            className={styles.deleteBtn}
            onClick={() => onRemove(item.id)}
            aria-label="Remove item"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      <div className={styles.pricing}>
        {item.originalPrice > item.price && (
          <span className={styles.originalPrice}>₹{item.originalPrice.toLocaleString('en-IN')}</span>
        )}
        <span className={styles.salePrice}>₹{item.price.toLocaleString('en-IN')}</span>
        {item.discount > 0 && (
          <span className={styles.discount}>({item.discount}% Off)</span>
        )}
      </div>
    </div>
  );
};

export default CartDrawerItem;
