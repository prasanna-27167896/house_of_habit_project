import { useEffect, useState } from 'react';
import styles from './SlidePanel.module.css';
import { lenis } from '../../../utils/lenis';


const SlidePanel = ({ isOpen, onClose, children, duration = 600, className = '', overlayClassName = '' }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
      setIsClosing(false);
    } else {
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }
    return () => {
      document.body.style.overflow = '';
      if (lenis) lenis.start();
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

  return (
    <div
      className={`${styles.overlay} ${overlayClassName}`}
      onClick={() => animateClose()}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`${styles.panel} ${isClosing ? styles.closing : ''} ${className}`}
        style={{ '--slide-duration': `${duration}ms` }}
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
      >
        {resolvedChildren}
      </div>
    </div>
  );
};

export default SlidePanel;
