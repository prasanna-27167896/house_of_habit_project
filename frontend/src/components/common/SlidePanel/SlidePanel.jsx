import { useEffect, useState } from 'react';
import styles from './SlidePanel.module.css';


const SlidePanel = ({ isOpen, onClose, children, duration = 600, className = '', overlayClassName = '', direction = 'down' }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;


  const animateClose = (cb) => {
    setIsClosing(true);
    setTimeout(() => {
      cb?.();
      onClose();
    }, duration);
  };

  const resolvedChildren =
    typeof children === 'function' ? children({ animateClose }) : children;

  const directionClass = direction === 'up' ? styles.slideUp : '';

  return (
    <div
      className={`${styles.overlay} ${overlayClassName}`}
      onClick={() => animateClose()}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`${styles.panel} ${directionClass} ${isClosing ? styles.closing : ''} ${className}`}
        style={{ '--slide-duration': `${duration}ms` }}
        onClick={(e) => e.stopPropagation()}
      >
        {resolvedChildren}
      </div>
    </div>
  );
};

export default SlidePanel;
