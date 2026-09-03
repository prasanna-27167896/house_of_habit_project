import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./AuthPopup.module.css";
import OtpStep from "./OtpStep";
import EmailStep from "./EmailStep";
import DetailsStep from "./DetailsStep";
import SuccessStep from "./SuccessStep";
import LogoWhite from "../../../assets/icons/hoh-logo-white.svg?react";
import {
  sendVerificationOtp,
  verifyOtp,
  sendLoginOtp,
  verifyLoginOtp,
  registerUser,
  clearError,
} from "../../../store/slices/authSlice";

const STEPS = {
  EMAIL: "email",
  OTP: "otp",
  DETAILS: "details",
  SUCCESS: "success",
};

// Bug #3: track whether we're doing a sign-up or login flow
const FLOWS = { REGISTER: "register", LOGIN: "login" };

const AuthPopup = ({ isOpen, onClose, mode: initialMode = "login" }) => {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [flow, setFlow] = useState(null); // "register" or "login" — decided after email step
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setStep(STEPS.EMAIL);
      setFlow(null);
      setEmail("");
      setName("");
      setPhone("");
      dispatch(clearError());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (step === STEPS.SUCCESS) {
      const timer = setTimeout(() => {
        handleClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  if (!isOpen) return null;

  const handleClose = () => {
    const wasAuthenticated = isAuthenticated;
    setStep(STEPS.EMAIL);
    setFlow(null);
    setEmail("");
    setName("");
    setPhone("");
    dispatch(clearError());
    onClose();
    if (wasAuthenticated) {
      navigate("/");
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  };

  const renderStep = () => {
    switch (step) {
      case STEPS.EMAIL:
        return (
          <EmailStep
            initialEmail={email}
            mode={initialMode}
            error={error}
            isLoading={isLoading}
            onSubmit={async (submittedEmail) => {
              dispatch(clearError());
              // Try sign-up OTP first
              const result = await dispatch(sendVerificationOtp(submittedEmail));
              if (sendVerificationOtp.fulfilled.match(result)) {
                // New user — proceed with registration flow
                setEmail(submittedEmail);
                setFlow(FLOWS.REGISTER);
                setStep(STEPS.OTP);
              } else {
                // Check if the error is "already registered" (409)
                const errMsg =
                  typeof result.payload === "string"
                    ? result.payload
                    : result.payload?.message || "";
                const isAlreadyRegistered = errMsg.toLowerCase().includes("already registered");

                if (isAlreadyRegistered) {
                  // Existing user — switch to login flow
                  dispatch(clearError());
                  const loginResult = await dispatch(sendLoginOtp(submittedEmail));
                  if (sendLoginOtp.fulfilled.match(loginResult)) {
                    setEmail(submittedEmail);
                    setFlow(FLOWS.LOGIN);
                    setStep(STEPS.OTP);
                  }
                  // If sendLoginOtp fails, the error will be shown by Redux state
                }
                // If it's some other error (network etc.), the error is already in Redux state
              }
            }}
          />
        );

      case STEPS.OTP:
        return (
          <OtpStep
            contact={email}
            error={error}
            isLoading={isLoading}
            onResend={async () => {
              dispatch(clearError());
              if (flow === FLOWS.LOGIN) {
                await dispatch(sendLoginOtp(email));
              } else {
                await dispatch(sendVerificationOtp(email));
              }
            }}
            onVerify={async (otpCode) => {
              dispatch(clearError());

              if (flow === FLOWS.LOGIN) {
                // Login flow — verify via login endpoint, which returns user + token
                const result = await dispatch(
                  verifyLoginOtp({ email, otp: Number(otpCode) })
                );
                if (verifyLoginOtp.fulfilled.match(result)) {
                  // User is now logged in (Redux state updated by the slice)
                  setStep(STEPS.SUCCESS);
                }
              } else {
                // Register flow — verify email ownership, then show details step
                const result = await dispatch(
                  verifyOtp({ email, otp: Number(otpCode) })
                );
                if (verifyOtp.fulfilled.match(result)) {
                  setStep(STEPS.DETAILS);
                }
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
            error={error}
            isLoading={isLoading}
            onSubmit={async (formData) => {
              dispatch(clearError());
              const result = await dispatch(
                registerUser({
                  fullName: formData.name,
                  mobile: formData.phone,
                  email: formData.email,
                })
              );
              if (registerUser.fulfilled.match(result)) {
                setStep(STEPS.SUCCESS);
              }
            }}
          />
        );

      case STEPS.SUCCESS:
        return <SuccessStep />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={styles.modalWrapper}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close"
        >
          &#x2715;
        </button>
        <div className={styles.container}>
          <div className={styles.leftPanel}>
            <div className={styles.leftContent}>
              <LogoWhite className={styles.logo} />
              <p className={styles.welcomeText}>
                Welcome! Register to avail the deals!
              </p>
            </div>
          </div>
          <div className={styles.rightPanel}>{renderStep()}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;
