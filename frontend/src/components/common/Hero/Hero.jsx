import styles from './Hero.module.css';

export const Hero = ({ image, title, subtitle }) => (
  <section className={styles.hero}>
    <div className={styles.heroLeft}>
      <h1 className={styles.heroTitle}>{title}</h1>
      <span className={styles.heroIcon}>
        <img src={image} alt='Arrow Icon' />
      </span>
    </div>
    <p className={styles.heroSub}>{subtitle}</p>
  </section>
);
