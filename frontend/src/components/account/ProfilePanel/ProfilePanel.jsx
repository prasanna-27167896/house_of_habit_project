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
  const [isEditing, setIsEditing] = useState(false);

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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleToggle = () => setIsEditing((prev) => !prev);

  return (
    <div className={styles.panel}>
      <div className={styles.banner} />

      <div className={styles.profileHeader}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>{getInitial(form.name || name)}</div>
          <div className={styles.userInfo}>
            <p className={styles.greeting}>{getGreeting()}</p>
            <p className={styles.emailText}>{form.name ? form.name : form.email}</p>
          </div>
        </div>
        <button className={styles.editBtn} onClick={handleToggle}>
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className={styles.infoGrid}>
        <FormField label='Full Name' name='name' type='text' value={form.name} onChange={handleChange} isEditing={isEditing} />
        <FormField label='Mobile No' name='mobile' type='tel' value={form.mobile} onChange={handleChange} isEditing={isEditing} />
        <FormField label='Email ID' name='email' type='email' value={form.email} onChange={handleChange} isEditing={isEditing} />
      </div>
    </div>
  );
};

export default ProfilePanel;
