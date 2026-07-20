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
  registerUser,
  clearError,
} from "../../../store/slices/authSlice";
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

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  const zustandLogin = useAuthStore((state) => state.login);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setStep(STEPS.EMAIL);
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
    setMode(initialMode);
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
            mode={mode}
            error={error}
            isLoading={isLoading}
            onSubmit={async (submittedEmail) => {
              dispatch(clearError());
              const result = await dispatch(sendVerificationOtp(submittedEmail));
              if (sendVerificationOtp.fulfilled.match(result)) {
                setEmail(submittedEmail);
                setStep(STEPS.OTP);
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
              await dispatch(sendVerificationOtp(email));
            }}
            onVerify={async (otpCode) => {
              dispatch(clearError());
              const result = await dispatch(
                verifyOtp({ email, otp: Number(otpCode) })
              );
              if (verifyOtp.fulfilled.match(result)) {
                const resData = result.payload.data || result.payload;
                if (resData?.user && resData?.accessToken) {
                  zustandLogin(resData.user, resData.accessToken);
                  onClose();
                  navigate("/");
                  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                } else {
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
                const resData = result.payload.data || result.payload;
                if (resData?.user && resData?.accessToken) {
                  zustandLogin(resData.user, resData.accessToken);
                }
                setStep(STEPS.SUCCESS);
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
      <div className={styles.modalWrapper} onClick={(e) => e.stopPropagation()}>
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
