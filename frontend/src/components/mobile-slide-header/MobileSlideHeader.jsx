import styles from './MobileSlideHeader.module.css';

import LogoIcon from '../../assets/icons/hoh-logo.svg?react';
import CloseIcon from '../../assets/icons/nav-mobile-close-icon.svg?react';


const MobileSlideHeader = ({ animateClose }) => {


    return (
        <div className={styles.header}>
            <div className={styles.logo}><LogoIcon /></div>
            <button
                className={styles.closeBtn}
                onClick={() => animateClose()}
                aria-label="Close cart"
            >
                <CloseIcon />
            </button>
        </div>
    )
};

export default MobileSlideHeader;
