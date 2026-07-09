import { useState } from 'react';
import styles from './DeliveryCheck.module.css';

const DeliveryCheck = () => {
  const [pincode, setPincode] = useState('');

  const handleCheck = () => {
    if (!pincode.trim()) return;
    // Delivery check logic
  };

  return (
    <div className={styles.wrapper}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Check Delivery Date</legend>
        <div className={styles.inputGroup}>
          <input
            type='text'
            className={styles.input}
            placeholder='Check Your Pincode'
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            maxLength={6}
          />
          <button type='button' className={styles.checkBtn} onClick={handleCheck}>
            Check
          </button>
        </div>
      </fieldset>
    </div>
  );
};

export default DeliveryCheck;
