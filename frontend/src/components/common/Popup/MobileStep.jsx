import styles from './steps.module.css';

const MobileStep = ({ phone, setPhone, onSubmit }) => {
  const isValid = phone.length === 10;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) onSubmit();
  };

  return (
    <form className={styles.step} onSubmit={handleSubmit}>
      <div className={styles.authContainer}>
        <h2 className={styles.title}>Login with OTP</h2>
        <p className={styles.subtitle}>Enter Your Mobile No</p>
        <div className={styles.inputGroup}>
          <span className={styles.prefix}>+91</span>
          <input
            className={styles.input}
            type='tel'
            placeholder='Phone number'
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            autoFocus
          />
        </div>
        <button type='submit' className={`${styles.submitBtn} ${isValid ? styles.btnActive : styles.btnInactive}`} disabled={!isValid}>
          Request OTP
        </button>
      </div>

      <p className={styles.footerText}>
        I accept that i have read &amp; understand
        <br />
        <a href='/privacy-policy'>privacy policy</a> and <a href='/terms'>T&amp;Cs.</a>
      </p>
    </form>
  );
};

export default MobileStep;
