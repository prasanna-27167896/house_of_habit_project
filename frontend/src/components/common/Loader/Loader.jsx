import styles from './Loader.module.css';

export default function Loader({ loadingText }) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.loader}></span>
      <p className={styles.text}>{loadingText}</p>
    </div>
  );
}
