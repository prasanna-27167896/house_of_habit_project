import { useEffect } from "react";
import styles from "./LogoutPopup.module.css";
import Loader from "../Loader/Loader";

const LogoutSymbol = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#F37021"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const LogoutPopup = ({ isOpen, onClose, onConfirm, isLoggingOut = false }) => {
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
    <div className={styles.overlay} onClick={isLoggingOut ? undefined : onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconCircle}>
          <LogoutSymbol />
        </div>
        <h3 className={styles.title}>Leaving so soon?</h3>
        <p className={styles.subtext}>
          Do you really want to log out from your account?
        </p>

        {isLoggingOut ? (
          <div style={{ padding: "0.8rem 0", display: "flex", justifyContent: "center" }}>
            <Loader loadingText="Logging out..." />
          </div>
        ) : (
          <div className={styles.actions}>
            <button className={styles.confirmBtn} onClick={onConfirm}>
              Yes, Log out
            </button>
            <button className={styles.stayBtn} onClick={onClose}>
              No, I am staying
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoutPopup;
