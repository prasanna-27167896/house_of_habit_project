import { useState } from 'react';
import styles from './ProfilePanel.module.css';
import FormField from '../../../components/common/FormField/FormField';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning!';
  if (hour < 17) return 'Good Afternoon!';
  return 'Good Evening!';
};

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const ProfilePanel = ({ user = { name: 'Siddua', email: 'siddua@gmail.com', mobile: '+91 9620099167' } }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ mobile: user.mobile, email: user.email });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleToggle = () => setIsEditing((prev) => !prev);

  return (
    <div className={styles.panel}>
      <div className={styles.banner} />

      <div className={styles.profileHeader}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>{getInitial(user.name)}</div>
          <div className={styles.userInfo}>
            <p className={styles.greeting}>{getGreeting()}</p>
            <p className={styles.emailText}>{form.email}</p>
          </div>
        </div>
        <button className={styles.editBtn} onClick={handleToggle}>
          {isEditing ? 'Update' : 'Edit'}
        </button>
      </div>

      <div className={styles.infoGrid}>
        <FormField label='Mobile No' name='mobile' type='tel' value={form.mobile} onChange={handleChange} isEditing={isEditing} />
        <FormField label='Email ID' name='email' type='email' value={form.email} onChange={handleChange} isEditing={isEditing} />
      </div>
    </div>
  );
};

export default ProfilePanel;
