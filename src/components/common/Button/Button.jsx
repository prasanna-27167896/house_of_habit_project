import { Children, isValidElement } from 'react';
import styles from './Button.module.css';
import ArrowIcon from '../../../assets/icons/arrow-btn.svg?react';

function Button({ children, variant = 'primary', size = 'sm', className = '', type = 'button', bgColor, textColor, pillColor, ...rest }) {
  const childArray = Children.toArray(children);

  // ❌ Ignore icon passed from outside, always use internal arrow
  const label = childArray.filter((child) => !isValidElement(child));

  const style = {
    ...(bgColor && { '--btn-bg': bgColor }),
    ...(textColor && { '--btn-text': textColor }),
    ...(pillColor && { '--pill-bg': pillColor }),
  };

  // If no label → fallback normal button
  if (!label.length) {
    return (
      <button
        type={type}
        className={`${styles.btn} ${styles.noIcon} ${styles[variant] || ''} ${styles[size] || ''} ${className}`}
        style={style}
        {...rest}
      >
        <span className={styles.label}>{children}</span>
      </button>
    );
  }

  return (
    <button type={type} className={`${styles.btn} ${styles[variant] || ''} ${styles[size] || ''} ${className}`} style={style} {...rest}>
      {/* Expanding pill */}
      <span className={styles.pill}>
        <span className={styles.icon}>
          <ArrowIcon width={30} height={30} />
        </span>
      </span>

      {/* Hidden sizer — in normal flow so it drives the button's intrinsic width */}
      <span className={styles.sizer} aria-hidden='true'>
        {label}
      </span>

      {/* Labels */}
      <span className={`${styles.label} ${styles.labelOut}`} aria-hidden='true'>
        {label}
      </span>
      <span className={`${styles.label} ${styles.labelIn}`}>{label}</span>
    </button>
  );
}

export default Button;
