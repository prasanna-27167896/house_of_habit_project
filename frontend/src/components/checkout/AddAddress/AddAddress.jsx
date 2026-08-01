import { useState } from 'react';
import styles from './AddAddress.module.css';

const AddAddress = ({ onContinue }) => {
  const [pincode, setPincode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onContinue) {
      onContinue(pincode);
    }
  };

  return (
    <form className={styles.wrapper} onSubmit={handleSubmit}>
      {/* Title */}
      <h3 className={styles.title}>Add Delivery Address</h3>

      {/* Input Group */}
      <div className={styles.inputGroup}>
        <div className={styles.inputWrapper}>
          <label className={styles.label}>Pincode</label>
          <input
            type="number"
            className={styles.input}
            placeholder="Enter your Pincode"
            value={pincode}
            onChange={(e) => {
              if (e.target.value.length > 6) {
                e.target.value = e.target.value.slice(0, 6);
              }
              setPincode(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Footer Continue Button */}
      <div className={styles.footer}>
        <button className={styles.continueBtn} type="submit">
          Continue
        </button>
      </div>
    </form>
  );
};

export default AddAddress;
