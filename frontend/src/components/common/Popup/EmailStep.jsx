import { useState } from "react";
import styles from "./steps.module.css";

const EmailStep = ({
  initialEmail = "",
  mode = "login",
  onSubmit,
  error,
  isLoading,
}) => {
  const [email, setEmail] = useState(initialEmail || "");

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid && !isLoading) onSubmit(email);
  };

  return (
    <form className={styles.step} onSubmit={handleSubmit}>
      <div className={styles.authContainer}>
        <h2 className={styles.title}>
          {mode === "register" ? "You're almost there" : "Login with Email"}
        </h2>
        <p className={styles.subparagraph}>
          {mode === "register"
            ? "Provide an email to receive a verification code"
            : "Enter your email to request an OTP"}
        </p>

        <input
          className={styles.emailInput}
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          disabled={isLoading} // Optional: disable input while loading
        />

        {error && <p className={styles.errorMessage}>{error}</p>}

        <div className={styles.footerSection}>
          <button
            type="submit"
            className={`${styles.submitBtn} ${isValid && !isLoading ? styles.btnActive : styles.btnInactive}`}
            disabled={!isValid || isLoading}
          >
            {isLoading ? "Please wait..." : "Request OTP"}
          </button>
          <p className={styles.footerText}>
            I accept that I have read &amp; understand
            <br />
            <a href="/privacy-policy">privacy policy</a> and{" "}
            <a href="/terms">T&amp;Cs.</a>
          </p>
        </div>
      </div>

    </form>
  );
};

export default EmailStep;
