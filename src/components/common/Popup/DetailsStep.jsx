import { useState, useEffect } from 'react';
import styles from './steps.module.css';

const DetailsStep = ({ name: initialName = '', setName, phone: initialPhone = '', setPhone, email = '', onSubmit }) => {
  const [localName, setLocalName] = useState(initialName);
  const [localPhone, setLocalPhone] = useState(initialPhone);
  const [localEmail, setLocalEmail] = useState(email);

  useEffect(() => {
    setLocalEmail(email);
  }, [email]);

  const isValid = localName.trim().length > 1 && /^[0-9]{10}$/.test(localPhone) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    if (setName) setName(localName);
    if (setPhone) setPhone(localPhone);
    onSubmit({ name: localName, phone: localPhone, email: localEmail });
  };

  return (
    <>
      <form className={styles.step} onSubmit={handleSubmit}>
        <div className={styles.authContainer}>
          <h2 className={styles.title}>Enter Account Details</h2>
          <p className={styles.subparagraph}>Create your account to continue</p>

          <input
            className={styles.emailInput}
            type='text'
            placeholder='Full name'
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            autoFocus
          />

          <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
            <span className={styles.prefix}>+91</span>
            <input
              className={styles.input}
              type='tel'
              placeholder='Mobile number'
              maxLength={10}
              value={localPhone}
              onChange={(e) => setLocalPhone(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <input
            className={styles.emailInput}
            type='email'
            placeholder='Email address'
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
          />

          <button type='submit' className={`${styles.submitBtn} ${isValid ? styles.btnActive : styles.btnInactive}`} disabled={!isValid}>
            Update
          </button>
        </div>
      </form>

      {/* <p className={styles.footerText}>
        I accept that i have read &amp; understand
        <br />
        <a href='/privacy-policy'>privacy policy</a> and <a href='/terms'>T&amp;Cs.</a>
      </p> */}
    </>
  );
};

export default DetailsStep;
