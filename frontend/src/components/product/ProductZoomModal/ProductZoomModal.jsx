import { useState, useEffect, useRef } from 'react';
import styles from './ProductZoomModal.module.css';
import headerStyles from '../../layouts/Header/Header.module.css';

import LogoIcon from '../../../assets/icons/hoh-logo.svg?react';
import MenuIcon from '../../../assets/icons/MenuIcon.svg?react';
import ZoomInIcon from '../../../assets/icons/zoom-in-icon.svg?react';
import ZoomOutIcon from '../../../assets/icons/zoom-out-icon.svg?react';
import ZoomCloseIcon from '../../../assets/icons/zoom-close-icon.svg?react';

const ProductZoomModal = ({ isOpen, onClose, images = [], initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [slideOffset, setSlideOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchCurrentRef = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef(0);
  const thumbRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoomScale(1.0);
      setPanOffset({ x: 0, y: 0 });
      setSlideOffset(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (isOpen && thumbRefs.current[currentIndex]) {
      thumbRefs.current[currentIndex].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentIndex, isOpen]);

  if (!isOpen || !images.length) return null;

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.5, 3.0));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const nextScale = Math.max(prev - 0.5, 1.0);
      if (nextScale === 1.0) {
        setPanOffset({ x: 0, y: 0 });
      }
      return nextScale;
    });
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      touchCurrentRef.current = { x: touch.clientX, y: touch.clientY };
      setIsSwiping(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isSwiping || e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchCurrentRef.current = { x: touch.clientX, y: touch.clientY };
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (zoomScale === 1) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setSlideOffset(deltaX);
      }
    } else {
      setPanOffset((prev) => ({
        x: prev.x + (touch.clientX - touchStartRef.current.x),
        y: prev.y + (touch.clientY - touchStartRef.current.y),
      }));
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    if (zoomScale === 1) {
      const deltaX = touchCurrentRef.current.x - touchStartRef.current.x;
      const threshold = 40;
      if (deltaX < -threshold && currentIndex < images.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (deltaX > threshold && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    }
    setSlideOffset(0);
  };

  const handleImageClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (zoomScale > 1) {
        setZoomScale(1.0);
        setPanOffset({ x: 0, y: 0 });
      } else {
        setZoomScale(2.0);
      }
    }
    lastTapRef.current = now;
  };

  const handleSelectThumbnail = (index) => {
    setCurrentIndex(index);
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
    setSlideOffset(0);
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modalContent}>
        {/* Top Header Navbar */}
        <header className={`${headerStyles.header} ${styles.modalHeader}`}>
          <div className={headerStyles.inner}>
            <div className={headerStyles.logo} onClick={onClose}>
              <LogoIcon />
            </div>
            <nav className={headerStyles.actions}>
              <button
                type="button"
                className={`${headerStyles.iconBtn} ${styles.menuIconBtn}`}
                aria-label="Menu"
                onClick={onClose}
              >
                <MenuIcon width={32} height={32} />
              </button>
            </nav>
          </div>
        </header>

        {/* Action Controls Bar */}
        <div className={styles.actionsBar}>
          <div className={styles.zoomControls}>
            <button
              type="button"
              className={`${styles.actionBtn} ${zoomScale <= 1.0 ? styles.activeZoomOut : ''}`}
              onClick={handleZoomOut}
              disabled={zoomScale <= 1.0}
              aria-label="Zoom Out"
            >
              <ZoomInIcon width={38} height={38} />
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${zoomScale >= 3.0 ? styles.disabledZoom : ''}`}
              onClick={handleZoomIn}
              disabled={zoomScale >= 3.0}
              aria-label="Zoom In"
            >
              <ZoomOutIcon width={38} height={38} />
            </button>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close popup"
          >
            <ZoomCloseIcon width={38} height={38} />
          </button>
        </div>

        {/* Main Image Container */}
        <div
          className={styles.mainViewContainer}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleImageClick}
        >
          <div
            className={styles.sliderTrack}
            style={{
              transform: `translateX(calc(-${currentIndex * 100}% + ${slideOffset}px))`,
              transition: isSwiping ? 'none' : 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className={styles.slideItem}
                style={
                  idx === currentIndex
                    ? {
                        transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)`,
                        transition: isSwiping ? 'none' : 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
                      }
                    : {}
                }
              >
                <img
                  src={imgUrl}
                  alt={`Product zoomed ${idx + 1}`}
                  className={styles.mainImg}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Thumbnail Bar */}
        <div className={styles.thumbnailBar}>
          {images.map((imgUrl, idx) => (
            <button
              key={idx}
              ref={(el) => (thumbRefs.current[idx] = el)}
              type="button"
              className={`${styles.thumbItem} ${idx === currentIndex ? styles.thumbActive : ''}`}
              onClick={() => handleSelectThumbnail(idx)}
            >
              <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductZoomModal;
