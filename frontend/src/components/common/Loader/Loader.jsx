import styles from './Loader.module.css';

export default function Loader({ loadingText, showSpinner = true }) {
  return (
    <div className={styles.wrapper}>
      {showSpinner && <span className={styles.loader}></span>}
      {loadingText && <p className={styles.text}>{loadingText}</p>}
    </div>
  );
}
