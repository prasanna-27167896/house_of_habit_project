import { useState, useEffect } from 'react';
import styles from './HeroBanner.module.css';
import Button from '../../common/Button/Button';

import img1Desktop from '../../../assets/images/home-banner-carousal-image-1.png';
import img2Desktop from '../../../assets/images/home-banner-carousal-image-2.png';
import img3Desktop from '../../../assets/images/home-banner-carousal-image-3.png';

import img1Mobile from '../../../assets/images/home-banner-carousal-image-mobile-1.png';
import img2Mobile from '../../../assets/images/home-banner-carousal-image-mobile-2.png';
import img3Mobile from '../../../assets/images/home-banner-carousal-image-mobile-3.png';

const slides = [
  { desktop: img1Desktop, mobile: img1Mobile, alt: 'Banner Style 1' },
  { desktop: img2Desktop, mobile: img2Mobile, alt: 'Banner Style 2' },
  { desktop: img3Desktop, mobile: img3Mobile, alt: 'Banner Style 3' },
];

const RatingWidget = () => (
  <div className={styles.rating}>
    <div className={styles.avatars}>
      <span className={`${styles.avatar} ${styles.a1}`} />
      <span className={`${styles.avatar} ${styles.a2}`} />
      <span className={`${styles.avatar} ${styles.a3}`} />
    </div>
    <div className={styles.ratingText}>
      <strong>&#9733; 4.5+ Rating</strong>
      <span>Satisfied Customer</span>
    </div>
  </div>
);

const HeroBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleShopNow = () => {
    const el = document.getElementById('collections');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getSlideClass = (index) => {
    if (index === currentIndex) return styles.slideActive;
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    if (index === prevIndex) return styles.slidePrev;
    return styles.slideNext;
  };

  return (
    <section className={styles.hero}>
      {/* ── Carousel Images Layer ── */}
      <div className={styles.carouselLayer}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${styles.slide} ${getSlideClass(index)}`}
          >
            <picture className={styles.picture}>
              <source media="(max-width: 768px)" srcSet={slide.mobile} />
              <img src={slide.desktop} alt={slide.alt} className={styles.slideImg} />
            </picture>
          </div>
        ))}
      </div>

      <div className={styles.overlay} />

      {/* ── Content ── */}
      <div className={styles.content}>
        {/* Left Column: Vertical Indicator Dots + Button (Desktop) */}
        <div className={styles.leftCol}>
          <div className={styles.dots}>
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className={styles.desktopBtnWrapper}>
            <Button variant='light' size='sm' onClick={handleShopNow}>
              Shop Now
            </Button>
          </div>
        </div>

        {/* Text Block: Heading + Subtitle + Rating / Mobile Button */}
        <div className={styles.textBlock}>
          <h1 className={styles.heading}>Wear Your Identity</h1>
          <div className={styles.subBlock}>
            <p className={styles.sub}>
              Contemporary clothing crafted for
              <br className={styles.desktopBr} />
              everyday confidence.
            </p>
            <RatingWidget />
          </div>
          <div className={styles.mobileBtnWrapper}>
            <Button variant='light' size='sm' onClick={handleShopNow}>
              Shop Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
