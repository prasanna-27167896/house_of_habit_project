import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./steps.module.css";

// Set to 4 digits as per your backend update
const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

const OtpStep = ({ contact, onVerify, error, isLoading }) => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const inputsRef = useRef([]);

  const isValid = otp.every((d) => d !== "");

  // Handle the resend countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // Handle typing digits
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // Handle backspace to auto-focus previous input
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Handle pasting a full 4-digit code
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setOtp(next);

    // Focus the last filled input
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }, []);

  const handleResend = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setTimer(RESEND_SECONDS);
    // You could also trigger an API call to resend the OTP here if you wanted,
    // or pass down an `onResend` prop from AuthPopup.
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid && !isLoading) onVerify(otp.join(""));
  };

  return (
    <form className={styles.step} onSubmit={handleSubmit}>
      <div className={styles.authContainer}>
        <h2 className={styles.title}>Login with OTP</h2>
        <p className={styles.subparagraph}>
          We have sent verification code to
          <br />
          <span className={styles.phoneHighlight}>{contact}</span>
        </p>

        <div className={styles.otpGroup} onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              className={`${styles.otpBox} ${digit ? styles.otpBoxFilled : ""}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
              disabled={isLoading} // Lock inputs while verifying
            />
          ))}
        </div>

        {/* Display backend errors (e.g., "Invalid OTP. Attempts left: 3") */}
        {error && <p className={styles.errorMessage}>{error}</p>}

        <button
          type="button"
          className={styles.resendLink}
          onClick={handleResend}
          disabled={timer > 0 || isLoading}
        >
          {timer > 0 ? `Resend OTP in ${timer}sec` : "Resend OTP"}
        </button>

        <button
          type="submit"
          className={`${styles.submitBtn} ${isValid && !isLoading ? styles.btnActive : styles.btnInactive}`}
          disabled={!isValid || isLoading}
        >
          {isLoading ? "Verifying..." : "Verify"}
        </button>
      </div>

      <button type="button" className={styles.troubleLink}>
        Trouble Logging In?
      </button>
    </form>
  );
};

export default OtpStep;
