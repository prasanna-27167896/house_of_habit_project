import styles from './steps.module.css';
import HandShakeIcon from '../../../assets/images/hand-shake-image.png';

const SuccessStep = ({ bgColor }) => (
  <div className={styles.successStep} style={{ backgroundColor: bgColor }}>
    <img src={HandShakeIcon} alt='Handshake' />
    <p className={styles.successText}>Thanks for choosing us</p>
  </div>
);

export default SuccessStep;
