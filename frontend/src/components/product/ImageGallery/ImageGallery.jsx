import { useState } from 'react';
import styles from './ImageGallery.module.css';
import ProductZoomModal from '../ProductZoomModal/ProductZoomModal';

const ImageGallery = ({ images = [], zoomImages }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const modalImages = zoomImages && zoomImages.length > 0 ? zoomImages : images;

  const handleMainImageClick = () => {
    if (window.innerWidth <= 1024) {
      setIsZoomOpen(true);
    }
  };

  const handleThumbClick = (index) => {
    setActiveIndex(index);
    if (window.innerWidth <= 1024) {
      setIsZoomOpen(true);
    }
  };

  return (
    <>
      <div className={styles.gallery}>
        <div className={styles.thumbnails}>
          {images.map((img, i) => (
            <button
              key={i}
              type='button'
              className={`${styles.thumb} ${i === activeIndex ? styles.thumbActive : ''}`}
              onClick={() => handleThumbClick(i)}
            >
              <img src={img} alt={`View ${i + 1}`} loading='lazy' />
            </button>
          ))}
        </div>
        <div className={styles.mainImage} onClick={handleMainImageClick}>
          <img src={images[activeIndex]} alt='Product' />
        </div>
      </div>

      <ProductZoomModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        images={modalImages}
        initialIndex={activeIndex}
      />
    </>
  );
};

export default ImageGallery;
