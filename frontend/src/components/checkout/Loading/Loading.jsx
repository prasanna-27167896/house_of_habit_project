import styles from './Loading.module.css';
import loaderStyles from '../../common/Loader/Loader.module.css';

const Loading = ({ title = 'Add Delivery Address', message = 'Please Wait...' }) => {
  return (
    <div className={styles.wrapper}>
      {/* Title */}
      <h3 className={styles.title}>{title}</h3>

      {/* Loading Content */}
      <div className={styles.loadingContainer}>
        <p className={styles.message}>{message}</p>
        <span className={loaderStyles.loader} aria-label="Loading"></span>
      </div>
    </div>
  );
};

export default Loading;
