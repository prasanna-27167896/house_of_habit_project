import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import styles from './AccountPage.module.css';
import { Hero } from '../../components/common/Hero/Hero';
import AccountSidebar from '../../components/account/AccountSidebar/AccountSidebar';
import ProfilePanel from '../../components/account/ProfilePanel/ProfilePanel';
import OrdersPanel from '../../components/account/OrdersPanel/OrdersPanel';
import SupportPanel from '../../components/account/SupportPanel/SupportPanel';
import AddressPanel from '../../components/account/AddressPanel/AddressPanel';
import { fetchUserProfile } from '../../store/slices/authSlice';

import MyAccountIcon from '../../assets/images/my-account-gif.png';

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  return (
    <main>
      <div className='container'>
        <Hero image={MyAccountIcon} title='My Account' subtitle='Manage your profile, orders, and preferences in one place.' />

        <div className={styles.layout}>
          <AccountSidebar activeTab={activeTab} onTabChange={setActiveTab} />

          <div className={styles.content}>
            {activeTab === 'profile' && <ProfilePanel />}
            {activeTab === 'orders' && <OrdersPanel />}
            {activeTab === 'addresses' && <AddressPanel />}
            {activeTab === 'support' && <SupportPanel />}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AccountPage;
