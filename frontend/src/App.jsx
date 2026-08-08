import { useState, useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Header from './components/layouts/Header/Header';
import Footer from './components/layouts/Footer/Footer';
import MobileNavBar from './components/layouts/MobileNavBar/MobileNavBar';
import AppRoutes from './routes/AppRoutes';
import CheckoutModal from './components/checkout/CheckoutModal/CheckoutModal';
import { fetchUserProfile } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
};



const AppContent = () => {
  const [openPanel, setOpenPanel] = useState(null);
  const dispatch = useDispatch();
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const isCheckoutRoute = location.pathname === '/checkout';
  const backgroundLocation = location.state?.backgroundLocation || (isCheckoutRoute ? { pathname: '/' } : null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const handleOpenAuth = () => setOpenPanel('profile');
    window.addEventListener('open-auth-panel', handleOpenAuth);
    return () => window.removeEventListener('open-auth-panel', handleOpenAuth);
  }, []);

  return (
    <>
      <ScrollToTop />
      <Header
        openPanel={openPanel}
        setOpenPanel={setOpenPanel}
      />
      <AppRoutes location={backgroundLocation || location} />
      {isCheckoutRoute && <CheckoutModal />}
      {!isCheckoutRoute && <Footer />}
      <MobileNavBar activePanel={openPanel} onAction={setOpenPanel} />
    </>
  );
};


const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
