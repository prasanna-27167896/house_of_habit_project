import styles from './HeroBanner.module.css';
import Button from '../../common/Button/Button';

const RatingWidget = () => (
  <div className={styles.rating}>
    <div className={styles.avatars}>
      <span className={`${styles.avatar} ${styles.a1}`} />
      <span className={`${styles.avatar} ${styles.a2}`} />
      <span className={`${styles.avatar} ${styles.a3}`} />
    </div>
    <div className={styles.ratingText}>
      <strong>4.0+ Rating</strong>
      <span>Satisfied Customer</span>
    </div>
  </div>
);

const HeroBanner = () => (
  <section className={styles.hero}>
    <div className={styles.overlay} />
    <div className={styles.content}>
      <Button variant='light' size='sm'>
        Shop Now
      </Button>
      <div className={styles.textBlock}>
        <h1 className={styles.heading}>Wear Your Identity</h1>
        <div className={styles.subBlock}>
          <p className={styles.sub}>
            Contemporary clothing crafted for
            <br />
            everyday confidence.
          </p>
          <RatingWidget />
        </div>
      </div>
    </div>
  </section>
);

export default HeroBanner;
