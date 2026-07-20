import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePanel.module.css';
import FormField from '../../../components/common/FormField/FormField';
import DeleteAccountPopup from '../../../components/common/Popup/DeleteAccountPopup';
import { logout } from '../../../store/slices/authSlice';
import api from '../../../utils/axiosInstance';
import useAuthStore from '../../../store/useAuthStore';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning!';
  if (hour < 17) return 'Good Afternoon!';
  return 'Good Evening!';
};

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

const DeleteAccountIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ff3b30"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const ProfilePanel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const zustandLogout = useAuthStore((state) => state.logout);
  const currentUser = useSelector((state) => state.auth.user);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete('/user/delete');
      navigate('/', { replace: true });
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      dispatch(logout());
      zustandLogout();
    } catch (err) {
      console.error('Failed to delete account:', err);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
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

        <div className={styles.securitySection}>
          <h4 className={styles.securityTitle}>Security</h4>
          <button className={styles.deleteAccountBtn} onClick={() => setShowDeleteModal(true)}>
            <DeleteAccountIcon />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      <DeleteAccountPopup
        isOpen={showDeleteModal}
        isDeleting={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default ProfilePanel;
