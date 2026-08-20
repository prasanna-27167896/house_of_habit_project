import styles from './PanelHeader.module.css';

const PanelHeader = ({ title, subtitle, prefix, action }) => (
  <div className={styles.header}>
    <div className={styles.leftColumn}>
      <div className={styles.titleRow}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <h2 className={styles.title}>{title}</h2>
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
    {action && <div className={styles.action}>{action}</div>}
  </div>
);

export default PanelHeader;
