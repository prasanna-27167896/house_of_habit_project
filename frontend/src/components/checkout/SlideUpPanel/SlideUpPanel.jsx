import styles from './SlideUpPanel.module.css';

const SlideUpPanel = ({ isOpen, onClose, children }) => {
  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
        onClick={onClose}
      />
      <div
        className={`${styles.panel} ${isOpen ? styles.open : ''}`}
      >
        {/* Circle Close Button overlapping the top edge */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close panel">
          &#x2715;
        </button>

        {/* Curved Notch Top Header */}
        <div className={styles.notchHeader}>
          <div className={styles.notchLeft} />
          <div className={styles.notchCenter}>
            <svg viewBox="0 0 100 28" className={styles.notchSvg} xmlns="http://www.w3.org/2000/svg">
              <path d="M 0,0 C 10,0 25,22 50,22 C 75,22 90,0 100,0 L 100,28 L 0,28 Z" fill="#ffffff" />

            </svg>
          </div>
          <div className={styles.notchRight} />
        </div>

        {/* Content wrapper */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </>
  );
};

export default SlideUpPanel;
