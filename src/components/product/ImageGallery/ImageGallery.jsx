import { useState } from 'react';
import styles from './ImageGallery.module.css';

const ImageGallery = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={styles.gallery}>
      <div className={styles.thumbnails}>
        {images.map((img, i) => (
          <button
            key={i}
            type='button'
            className={`${styles.thumb} ${i === activeIndex ? styles.thumbActive : ''}`}
            onClick={() => setActiveIndex(i)}
          >
            <img src={img} alt={`View ${i + 1}`} loading='lazy' />
          </button>
        ))}
      </div>
      <div className={styles.mainImage}>
        <img src={images[activeIndex]} alt='Product' />
      </div>
    </div>
  );
};

export default ImageGallery;
