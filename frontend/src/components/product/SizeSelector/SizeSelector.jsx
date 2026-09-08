import styles from './SizeSelector.module.css';
import SizeGuideIcon from '../../../assets/icons/guide-icon.svg?react';

const SizeSelector = ({ sizes, activeSize, onSelect, onOpenGuide }) => (
  <div className={styles.wrapper}>
    <fieldset className={styles.fieldset}>
      <legend className={styles.label}>Size</legend>
      <div className={styles.options}>
        {sizes.map((size) => (
          <button
            key={size}
            type='button'
            className={`${styles.sizeBtn} ${size === activeSize ? styles.active : ''}`}
            onClick={() => onSelect(size)}
          >
            {size}
          </button>
        ))}
        <button
          type='button'
          className={styles.guideBtn}
          aria-label='Size guide'
          onClick={onOpenGuide}
        >
          <SizeGuideIcon width='28' height='28' />
        </button>
      </div>
    </fieldset>
  </div>
);

export default SizeSelector;
