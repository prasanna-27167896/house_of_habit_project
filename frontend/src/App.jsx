import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/layouts/Header/Header';
import Footer from './components/layouts/Footer/Footer';
import MobileNavBar from './components/layouts/MobileNavBar/MobileNavBar';
import AppRoutes from './routes/AppRoutes';
import { fetchUserProfile } from './store/slices/authSlice';

const AppContent = () => {
  const [openPanel, setOpenPanel] = useState(null);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <>
      <Header
        openPanel={openPanel}
        setOpenPanel={setOpenPanel}
      />
      <AppRoutes />
      <Footer />
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
