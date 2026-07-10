import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

const Breadcrumb = ({ items }) => (
  <nav className={styles.breadcrumb} aria-label='Breadcrumb'>
    {items.map((item, i) => (
      <span key={i} className={styles.item}>
        {item.to ? (
          <Link to={item.to} className={styles.link}>
            {item.label}
          </Link>
        ) : (
          <span className={styles.current}>{item.label}</span>
        )}
        {i < items.length - 1 && <span className={styles.separator}>{'>'}</span>}
      </span>
    ))}
  </nav>
);

export default Breadcrumb;
