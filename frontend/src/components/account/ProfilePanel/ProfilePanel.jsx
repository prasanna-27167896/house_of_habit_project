import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './ProfilePanel.module.css';
import FormField from '../../../components/common/FormField/FormField';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning!';
  if (hour < 17) return 'Good Afternoon!';
  return 'Good Evening!';
};

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const ProfilePanel = () => {
  const currentUser = useSelector((state) => state.auth.user);

  const name = currentUser?.fullName || currentUser?.name || 'User';
  const email = currentUser?.email || '';
  const mobile = currentUser?.mobile || currentUser?.phone || '';

  const [form, setForm] = useState({ name, mobile, email });

  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.fullName || currentUser.name || '',
        email: currentUser.email || '',
        mobile: currentUser.mobile || currentUser.phone || '',
      });
    }
  }, [currentUser]);

  return (
    <div className={styles.panel}>
      <div className={styles.banner} />

      <div className={styles.profileHeader}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>{getInitial(form.name || name)}</div>
          <div className={styles.userInfo}>
            <p className={styles.greeting}>{getGreeting()}</p>
            <p className={styles.nameText}>{form.name ? form.name : form.email}</p>
          </div>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.fullWidthField}>
          <FormField label="Name" name="name" type="text" value={form.name} isEditing={false} />
        </div>
        <FormField label="Mobile No" name="mobile" type="tel" value={form.mobile} isEditing={false} />
        <FormField label="Email ID" name="email" type="email" value={form.email} isEditing={false} />
      </div>
    </div>
  );
};

export default ProfilePanel;
