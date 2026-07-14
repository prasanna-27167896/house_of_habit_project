import styles from './SavingsBadge.module.css';

const SavingsBadge = ({ amount = 0 }) => {
  if (amount <= 0) return null;

  return (
    <div className={styles.badge}>
      ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Saved so far!
    </div>
  );
};

export default SavingsBadge;
