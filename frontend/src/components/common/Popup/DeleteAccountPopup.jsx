import { useEffect } from "react";
import styles from "./DeleteAccountPopup.module.css";
import Loader from "../Loader/Loader";
import DeletePopupIcon from "../../../assets/icons/delete-popup-icon.svg?react";

const DeleteAccountPopup = ({ isOpen, onClose, onConfirm, isDeleting = false }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={isDeleting ? undefined : onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconCircle}>
          <DeletePopupIcon width={60} height={60} />
        </div>
        <h3 className={styles.title}>Delete Account</h3>
        <p className={styles.subtext}>
          Are you sure you want to delete your account?
        </p>

        {isDeleting ? (
          <div style={{ padding: "0.8rem 0", display: "flex", justifyContent: "center" }}>
            <Loader loadingText="Deleting account..." />
          </div>
        ) : (
          <div className={styles.actions}>
            <button className={styles.deleteBtn} onClick={onConfirm}>
              Delete
            </button>
            <button className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteAccountPopup;
