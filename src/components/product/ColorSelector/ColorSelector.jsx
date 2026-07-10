import styles from './ColorSelector.module.css';

const ColorSelector = ({ colors, activeColor, onSelect }) => (
  <div className={styles.wrapper}>
    <fieldset className={styles.fieldset}>
      <legend className={styles.label}>Color : {activeColor}</legend>
      <div className={styles.options}>
        {colors.map((color) => (
          <button
            key={color.name}
            type='button'
            className={`${styles.swatch} ${color.name === activeColor ? styles.active : ''}`}
            onClick={() => onSelect(color.name)}
            aria-label={color.name}
          >
            <img src={color.image} alt={color.name} />
          </button>
        ))}
      </div>
    </fieldset>
  </div>
);

export default ColorSelector;
