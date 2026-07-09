import { useState } from 'react';
import styles from './Accordion.module.css';

const Accordion = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.accordion}>
      <button type='button' className={styles.header} onClick={() => setOpen((prev) => !prev)}>
        <span className={styles.title}>{title}</span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          width='18'
          height='18'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          viewBox='0 0 24 24'
        >
          <path d='M6 9l6 6 6-6' />
        </svg>
      </button>
      {open && <div className={styles.body}>{children}</div>}
    </div>
  );
};

export default Accordion;
