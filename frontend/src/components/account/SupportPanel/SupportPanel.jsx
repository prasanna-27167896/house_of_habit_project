import styles from './SupportPanel.module.css';
import PanelHeader from '../PanelHeader/PanelHeader';

const SupportPanel = () => (
  <div className={styles.panel}>
    <PanelHeader title='Help & Support' subtitle="We're here to help you with anything you need." />

    <div className={styles.body}>
      <div className={styles.inner}>
        <p className={styles.heading}>Need Help? We're here for you!</p>

        <div className={styles.item}>
          <span className={styles.icon}>📞</span>
          <span>
            Prefer a call? Reach us at:{' '}
            <a href='tel:+918884477728' className={styles.link}>
              +91 88844 77728
            </a>
          </span>
        </div>

        <div className={styles.item}>
          <span className={styles.icon}>📧</span>
          <span>
            Email us:{' '}
            <a href='mailto:support@houseofhabit.com' className={styles.link}>
              support@House of habit.com
            </a>
            <br />
            <span className={styles.note}>(We reply within 24 hours)</span>
          </span>
        </div>

        <div className={styles.item}>
          <span className={styles.icon}>🕐</span>
          <span>Working Hours: Mon–Sat, 10 am to 6 pm</span>
        </div>
      </div>
    </div>
  </div>
);

export default SupportPanel;
