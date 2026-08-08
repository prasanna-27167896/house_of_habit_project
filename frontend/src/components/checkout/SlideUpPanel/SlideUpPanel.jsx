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

        {/* Content wrapper */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </>
  );
};

export default SlideUpPanel;
