import { useState, useEffect } from "react";
import styles from "./AuthPopup.module.css";
import OtpStep from "./OtpStep";
import EmailStep from "./EmailStep";
import DetailsStep from "./DetailsStep";
import SuccessStep from "./SuccessStep";
import LogoWhite from "../../../assets/icons/hoh-logo-white.svg?react";
import api from "../../../utils/axiosInstance";
import useAuthStore from "../../../store/useAuthStore";

const STEPS = {
  EMAIL: "email",
  OTP: "otp",
  DETAILS: "details",
  SUCCESS: "success",
};
const MODES = { LOGIN: "login", REGISTER: "register" };

const AuthPopup = ({ isOpen, onClose, mode: initialMode = MODES.LOGIN }) => {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  // NEW: Loading state
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(STEPS.EMAIL);
    setMode(initialMode);
    setEmail("");
    setName("");
    setPhone("");
    setError("");
    setIsLoading(false); // Reset loading on close
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case STEPS.EMAIL:
        return (
          <EmailStep
            initialEmail={email}
            mode={mode}
            error={error}
            isLoading={isLoading} // Pass down
            onSubmit={async (submittedEmail) => {
              setError("");
              setIsLoading(true); // Start loading
              try {
                await api.post("/auth/send-otp", { email: submittedEmail });
                setEmail(submittedEmail);
                setStep(STEPS.OTP);
              } catch (err) {
                setError(
                  err.response?.data?.message ||
                    "Failed to send OTP. Try again.",
                );
              } finally {
                setIsLoading(false); // Stop loading regardless of success/fail
              }
            }}
          />
        );

      case STEPS.OTP:
        return (
          <OtpStep
            contact={email}
            error={error}
            isLoading={isLoading} // Pass down
            onVerify={async (otpCode) => {
              setError("");
              setIsLoading(true); // Start loading
              try {
                const response = await api.post("/auth/verify-otp", {
                  email,
                  otp: otpCode,
                });
                const { user } = response.data;

                if (!user.name || !user.phone) {
                  setStep(STEPS.DETAILS);
                } else {
                  login(user);
                  setStep(STEPS.SUCCESS);
                }
              } catch (err) {
                setError(
                  err.response?.data?.message ||
                    "Invalid OTP. Please try again.",
                );
              } finally {
                setIsLoading(false); // Stop loading
              }
            }}
          />
        );

      case STEPS.DETAILS:
        return (
          <DetailsStep
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            email={email}
            isLoading={isLoading}
            // 1. Accept the incoming data object here:
            onSubmit={async (formData) => {
              setError("");
              setIsLoading(true);

              // 2. Use formData to see the immediate values
              console.log("Submitting:", formData);

              try {
                const response = await api.post("/auth/onboard", {
                  // 3. Send the immediate values to your backend
                  name: formData.name,
                  phone: formData.phone,
                  email: formData.email,
                });
                login(response.data.user);
                setStep(STEPS.SUCCESS);
              } catch (err) {
                setError(
                  err.response?.data?.message ||
                    "Onboarding failed. Try again.",
                );
              } finally {
                setIsLoading(false);
              }
            }}
          />
        );

      case STEPS.SUCCESS:
        return <SuccessStep bgColor="#F4F4F4" />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <button
        className={styles.closeBtn}
        onClick={handleClose}
        aria-label="Close"
      >
        &#x2715;
      </button>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.leftPanel}>
          <div className={styles.leftContent}>
            <LogoWhite className={styles.logo} />
            {/* Fixed spelling from "Resister" to "Register" */}
            <p className={styles.welcomeText}>
              Welcome! Register to avail the deals!
            </p>
          </div>
        </div>
        <div className={styles.rightPanel}>{renderStep()}</div>
      </div>
    </div>
  );
};

export default AuthPopup;
