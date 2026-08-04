import styles from './QuantitySelector.module.css';

const QuantitySelector = ({ quantity = 1, onIncrement, onDecrement, min = 1, max = 10, disabled = false }) => {
  return (
    <div className={styles.wrapper}>
      <button
        className={styles.btn}
        onClick={onDecrement}
        disabled={disabled || quantity <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className={styles.value}>{quantity}</span>
      <button
        className={styles.btn}
        onClick={onIncrement}
        disabled={disabled || quantity >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};

export default QuantitySelector;
