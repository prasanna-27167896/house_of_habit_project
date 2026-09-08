import React, { useState, useEffect } from 'react';
import styles from './SizeGuideModal.module.css';
import { CloseIcon } from '../../common/Icons/Icons';
import SizeGuideMockupImage from '../../../assets/images/size-guide-mockup.png';

const DUMMY_SIZE_DATA_CM = [
  { size: 'S', length: 66, chest: 51, sleeve: 56 },
  { size: 'M', length: 70, chest: 53, sleeve: 57 },
  { size: 'L', length: 73, chest: 62, sleeve: 58 },
  { size: 'XL', length: 75, chest: 64, sleeve: 59 },
  { size: 'XXL', length: 80, chest: 67, sleeve: 73 },
];

const DUMMY_SIZE_DATA_IN = [
  { size: 'S', length: 26.0, chest: 20.1, sleeve: 22.0 },
  { size: 'M', length: 27.5, chest: 20.9, sleeve: 22.4 },
  { size: 'L', length: 28.7, chest: 24.4, sleeve: 22.8 },
  { size: 'XL', length: 29.5, chest: 25.2, sleeve: 23.2 },
  { size: 'XXL', length: 31.5, chest: 26.4, sleeve: 28.7 },
];

const SizeGuideModal = ({ isOpen, onClose, productName = 'Hoodie' }) => {
  const [unit, setUnit] = useState('CM'); // 'CM' or 'IN'

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tableData = unit === 'CM' ? DUMMY_SIZE_DATA_CM : DUMMY_SIZE_DATA_IN;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h2 id="size-guide-title" className={styles.title}>
              {productName}
            </h2>
            <span className={styles.subtitle}>Size Chart</span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close size guide"
          >
            <CloseIcon size={22} color="#28282B" strokeWidth={1.5} />
          </button>
        </div>

        {/* Unit Toggle */}
        <div className={styles.toggleRow}>
          <span className={`${styles.unitLabel} ${unit === 'CM' ? styles.activeLabel : ''}`}>
            CM
          </span>
          <button
            type="button"
            className={`${styles.toggleSwitch} ${unit === 'IN' ? styles.toggleActiveIn : ''}`}
            onClick={() => setUnit((prev) => (prev === 'CM' ? 'IN' : 'CM'))}
            aria-label={`Switch unit to ${unit === 'CM' ? 'Inches' : 'Centimeters'}`}
          >
            <span className={styles.toggleThumb} />
          </button>
          <span className={`${styles.unitLabel} ${unit === 'IN' ? styles.activeLabel : ''}`}>
            IN
          </span>
        </div>

        {/* Size Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.sizeTable}>
            <thead>
              <tr>
                <th>Size</th>
                <th>Length ({unit})</th>
                <th>Chest ({unit})</th>
                <th>Sleeve({unit})</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.size}>
                  <td className={styles.sizeCell}>{row.size}</td>
                  <td>{row.length}</td>
                  <td>{row.chest}</td>
                  <td>{row.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Garment Mockup Image */}
        <div className={styles.illustrationSection}>
          <img
            src={SizeGuideMockupImage}
            alt="Size Guide Measurement Diagram"
            className={styles.illustrationImg}
          />
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
