import { useState } from 'react';
import styles from './DebitCardForm.module.css';
import FormField from '../../common/FormField/FormField';

const DebitCardForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    fullName: '',
    cardNo: '',
    expiry: '',
    cvv: '',
  });
  const [showCvv, setShowCvv] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.fullName || !form.cardNo || !form.expiry || !form.cvv) return;
    onSubmit?.(form);
  };

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Debit Card</h3>

      <div className={styles.fields}>
        <FormField
          label="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          isEditing
          required
          placeholder="Enter your full name"
        />

        <FormField
          label="Card No"
          name="cardNo"
          value={form.cardNo}
          onChange={handleChange}
          isEditing
          required
          placeholder="Enter Card No"
        />

        <div className={styles.twoCol}>
          <FormField
            label="Expiry Date"
            name="expiry"
            value={form.expiry}
            onChange={handleChange}
            isEditing
            required
            placeholder="00/00/000"
          />

          <div className={styles.cvvWrap}>
            <FormField
              label="CVV No"
              name="cvv"
              type={showCvv ? 'text' : 'password'}
              value={form.cvv}
              onChange={handleChange}
              isEditing
              required
              placeholder="Enter CVV No"
            />
            <button
              className={styles.eyeBtn}
              onClick={() => setShowCvv(!showCvv)}
              type="button"
              aria-label={showCvv ? 'Hide CVV' : 'Show CVV'}
            >
              {showCvv ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <label className={styles.saveLabel}>
          <span
            className={`${styles.radio} ${saveCard ? styles.radioActive : ''}`}
            onClick={() => setSaveCard(!saveCard)}
          />
          Save card as per RBI Guidelines
        </label>
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onCancel} type="button">
          Cancel
        </button>
        <button className={styles.continueBtn} onClick={handleSubmit} type="button">
          Continue
        </button>
      </div>
    </div>
  );
};

export default DebitCardForm;
