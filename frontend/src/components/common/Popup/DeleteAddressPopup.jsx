import { useEffect } from 'react';
import styles from './DeleteAddressPopup.module.css';

const DeleteAddressPopup = ({ isOpen, onClose, onConfirm, addressString }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Delete Address</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <p className={styles.subtext}>
          The following address will be deleted from the customer. This can't be undone.
        </p>

        <div className={styles.addressBox}>
          {addressString}
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.deleteBtn} onClick={onConfirm}>
            Delete Address
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAddressPopup;
