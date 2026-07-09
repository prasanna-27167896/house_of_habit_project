import styles from './Footer.module.css';
import { footerData } from '../../../data/footerData';
import Button from '../../common/Button/Button';
import ArrowIconWhite from '../../../assets/icons/arrow-icon-white.svg?react';
import LogoIcon from '../../../assets/icons/hoh-logo-white.svg?react';
import FacebookIcon from '../../../assets/icons/facebook-icon.svg?react';
import TwitterIcon from '../../../assets/icons/twitter-icon.svg?react';
import LinkedInIcon from '../../../assets/icons/linkedin-icon.svg?react';
import InstagramIcon from '../../../assets/icons/instagram-icon.svg?react';

const SOCIAL_ICONS = {
  Facebook: FacebookIcon,
  Twitter: TwitterIcon,
  LinkedIn: LinkedInIcon,
  Instagram: InstagramIcon,
};

const FooterLogo = () => (
  <div className={styles.logoMark}>
    <LogoIcon />
  </div>
);

function Footer() {
  return (
    <footer className={styles.wrapper}>
      {/* CTA Section */}
      <div className={styles.cta}>
        <h2>{footerData.cta.title}</h2>
        <Button variant='light' size='sm'>
          Contact Us
        </Button>
      </div>

      {/* Main Footer */}
      <div className={styles.footer}>
        <div className={styles.brand}>
          <FooterLogo />
        </div>

        <div className={styles.footerContent}>
          <div className={styles.gridAddress}>
            <h4 className={styles.gridTitle}>Address</h4>
            {footerData.address.map((item, i) => (
              <>
                <p key={i}>{item}</p>
              </>
            ))}
          </div>
          <div className={styles.grid}>
            <div className={styles.gridContent}>
              <h4 className={styles.gridTitle}>Shop</h4>
              {footerData.shop.map((item, i) => (
                <p key={i}>{item}</p>
              ))}
            </div>

            <div className={styles.gridContent}>
              <h4 className={styles.gridTitle}>Policies</h4>
              {footerData.policies.map((item, i) => (
                <p key={i}>{item}</p>
              ))}
            </div>

            <div className={styles.gridContent}>
              <h4 className={styles.gridTitle}>Help</h4>
              {footerData.help.map((item, i) => (
                <p key={i}>{item}</p>
              ))}
            </div>

            <div className={styles.gridContent}>
              <h4 className={styles.gridTitle}>Contact Us</h4>
              {footerData.contact.map((item, i) => (
                <p key={i}>{item}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className={styles.social}>
          <p className={styles.socialLabel}>Follow our social media</p>
          <div className={styles.socialIcons}>
            {footerData.social.map((name) => {
              const IconComponent = SOCIAL_ICONS[name];
              return <IconComponent key={name} width={34} height={34} cursor='pointer' />;
            })}
          </div>
        </div>

        <div className={styles.bottom}>{footerData.copyright}</div>
      </div>
    </footer>
  );
}

export default Footer;
